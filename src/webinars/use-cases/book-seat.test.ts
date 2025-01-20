import { IUserRepository } from "src/users/ports/user-repository.interface";
import { IParticipationRepository } from "../ports/participation-repository.interface";
import { IWebinarRepository } from "../ports/webinar-repository.interface";
import { IMailer } from "src/core/ports/mailer.interface";
import { BookSeat } from "./book-seat";
import { User } from "src/users/entities/user.entity";
import { Webinar } from "../entities/webinar.entity";
import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";
import { InMemoryMailer } from "src/core/adapters/in-memory-mailer";
import { InMemoryParticipationRepository } from "../adapters/participation-repository.in-memory";
import { InMemoryUserRepository } from "src/users/adapters/user-repository.in-memory";
import { Participation } from "../entities/participation.entity";


describe('Feature: BookSeat', () =>{
    
    //Instanciation des variables dont nous allons avoir besoins 
    let participationRepository: IParticipationRepository;
    let userRepository: IUserRepository;
    let webinarRepository: IWebinarRepository;
    let mailer: IMailer;
    let useCase: BookSeat;

    //Initialisation des variables
    beforeEach(() =>{
        
        participationRepository = new InMemoryParticipationRepository();
        userRepository = new InMemoryUserRepository();
        webinarRepository = new InMemoryWebinarRepository();
        mailer = new InMemoryMailer();
        useCase = new BookSeat(
            participationRepository,
            userRepository,
            webinarRepository,
            mailer
        );
    });

    //Premier scénario -> Tous ce déroule correctement
    describe('Scenerio: happy path', () => {

        it('should book a seat and send an email to the organizer', async () => {
            //On crée un user pour simuler l'organisateur
            const organizer = new User({ id: 'org-1', email: 'organizer@example.com', password:'mdp'});
            //On crée le wibinar
            const webinar = new Webinar({
                id: 'webinar-1',
                organizerId: organizer.props.id,
                title: 'webinar',
                startDate: new Date('2024-01-10T10:00:00.000Z'),
                endDate: new Date('2024-01-10T10:00:00.000Z'),
                seats: 10,
            });
            //On crée un nouveau User
            const user = new User({ id: 'user-1', email: 'user@example.com', password:'mdp' });

            //On les ajoutes dans les BDD
            await userRepository.save(organizer);
            await userRepository.save(user);
            await webinarRepository.create(webinar);

            //On lance le use case
            await useCase.execute({ webinarId: webinar.props.id, user});

            //On vérifie que la participation à belle est bien été ajouté
            const participation = await participationRepository.getDataBase();
            expect(participation).toHaveLength(1);

            expect(participation[0]).toEqual(
                new Participation({ userId: 'user-1', webinarId: 'webinar-1' })
              );

            //On vérifie aussi l'envoie du mail
            expect(mailer.send).toHaveLength(1);
        
            const emails = await mailer.getEmails();
            expect(emails[0]).toEqual({
                to: 'organizer@example.com',
                subject: 'Nouvelle inscription au webinar',
                body: "Bonjour, un nouvel utilisateur s'est inscrit à votre webinar",
            });
        });

    });

    //Scénario -> la webinar n'existe pas
    describe('Scenario: webinar does not exist', () =>{
        it('should throw an error', async () => {

            //On crée un User et on l'enregistre dans la BDD
            const user = new User({ id: 'user-1', email: 'user@example.com', password:'mdp' });
            await userRepository.save(user);

            //On lance le use Case en vérifiant qu'on a bien l'erreur du webinar qui n'existe pas
            await expect(
                useCase.execute({webinarId: '1', user})
            ).rejects.toThrow('Webinar non trouvé');
        });
    });

    //Scénario -> l'utilisateur participe déjà à ce webinar
    describe('Scenario: user is already participating', () =>{
        it('should throw an error', async () =>{
            
            //Création du webinar, du user et de la participation et enregistrement dans les BDD
            const webinar = new Webinar({
                id: 'webinar-1',
                organizerId: 'org-1',
                title: 'webinar',
                startDate: new Date('2024-01-10T10:00:00.000Z'),
                endDate: new Date('2024-01-10T10:00:00.000Z'),
                seats: 10,
            });

            const user = new User({ id: 'user-1', email: 'user@example.com', password: 'mdp' });

            await webinarRepository.create(webinar);
            await participationRepository.save(
                new Participation({ userId: 'user-1', webinarId: 'webinar-1' })
              );

            //Lancement du use case et vérification de l'erreur
            await expect(
                useCase.execute({webinarId: webinar.props.id, user})
            ).rejects.toThrow("L'utilisateur participe déjà à ce webinar");
        });
    });

    //Scénario -> le webinar est complet
    describe('Scenario: webinar is full', () =>{
        it('should throw an error', async () =>{

            //Création du webinar, des users et de l'organisateur et enregistrement dans les BDD
            const orga = new User({ id: 'org-id', email: 'orga@example.com', password : 'mdp' });
            await userRepository.save(orga);

            const webinar = new Webinar({
                id: 'webinar-1',
                organizerId: orga.props.id,
                title: 'webinar',
                startDate: new Date('2024-01-10T10:00:00.000Z'),
                endDate: new Date('2024-01-10T10:00:00.000Z'),
                seats: 1,
            });

            const user1 = new User({ id: 'user-1', email: 'user1@example.com', password : 'mdp' });
            webinar.addUser();
            const user2 = new User({ id: 'user-2', email: 'user2@example.com', password : 'mdp2' });

            await userRepository.save(user1);
            await userRepository.save(user2); 

            await webinarRepository.create(webinar);

            //On ajoute le premier user
            await participationRepository.save(
                new Participation({ userId: user1.props.id, webinarId: webinar.props.id })
            );

            //Lancement du use case et vérification de l'erreur
            await expect(
                useCase.execute({ webinarId: webinar.props.id, user: user2 })
            ).rejects.toThrow('Le webinar est complet');
        });
    });

    //Scénario -> l'organisateur n'existe pas
    describe('Scenario: organizer does not exist', () => {
        it('should throw an error', async () => {
            
            //Création du webinar, du user et enregistrement dans les BDD
            const webinar = new Webinar({
                id: 'webinar-1',
                organizerId: 'org-1',
                title: 'webinar',
                startDate: new Date('2024-01-10T10:00:00.000Z'),
                endDate: new Date('2024-01-10T10:00:00.000Z'),
                seats: 10,
            });
          const user = new User({ id: 'user-1', email: 'user@example.com', password: 'mdp' });
    
          await webinarRepository.create(webinar);
          await userRepository.save(user);
    
          //Lancement du use case et vérification de l'erreur
          await expect(
            useCase.execute({ webinarId: webinar.props.id, user })
          ).rejects.toThrow('Organisateur non trouvé');
        });
      });

});