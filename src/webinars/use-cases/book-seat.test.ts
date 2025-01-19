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
    
    let participationRepository: IParticipationRepository;
    let userRepository: IUserRepository;
    let webinarRepository: IWebinarRepository;
    let mailer: IMailer;
    let useCase: BookSeat;

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

    describe('Scenerio: happy path', () => {

        it('should book a seat and send an email to the organizer', async () => {
            const organizer = new User({ id: 'org-1', email: 'organizer@example.com', password:'mdp'});
            const webinar = new Webinar({
                id: 'webinar-1',
                organizerId: organizer.props.id,
                title: 'webinar',
                startDate: new Date('2024-01-10T10:00:00.000Z'),
                endDate: new Date('2024-01-10T10:00:00.000Z'),
                seats: 10,
            });

            const user = new User({ id: 'user-1', email: 'user@example.com', password:'mdp' });

            await userRepository.save(organizer);
            await userRepository.save(user);
            await webinarRepository.create(webinar);

            await useCase.execute({ webinarId: webinar.props.id, user});

            const participation = await participationRepository.getDataBase();
            expect(participation).toHaveLength(1);

            expect(participation[0]).toEqual(
                new Participation({ userId: 'user-1', webinarId: 'webinar-1' })
              );

            expect(mailer.send).toHaveLength(1);
            
            const emails = await mailer.getEmails();
            expect(emails[0]).toEqual({
                to: 'organizer@example.com',
                subject: 'Nouvelle inscription au webinar',
                body: "Bonjour \nUn nouvel utilisateur s'est inscrit à votre webinar",
            });
        });

    });

    describe('Scenario: webinar does not exist', () =>{
        it('should throw an error', async () => {
            const user = new User({ id: 'user-1', email: 'user@example.com', password:'mdp' });
            await userRepository.save(user);

            await expect(
                useCase.execute({webinarId: '1', user})
            ).rejects.toThrow('Webinar non trouvé');
        });
    });

    describe('Scenario: user is already participating', () =>{
        it('should throw an error', async () =>{
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

            await expect(
                useCase.execute({webinarId: webinar.props.id, user})
            ).rejects.toThrow("L'utilisateur participe déjà à ce webinar");
        });
    });

    /*describe('Scenario: webinar is full', () =>{
        it('should throw an error', async () =>{

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
            const user2 = new User({ id: 'user-2', email: 'user2@example.com', password : 'mdp2' });

            await userRepository.save(user1);
            await userRepository.save(user2);

            await webinarRepository.create(webinar);

            await participationRepository.save(
                new Participation({ userId: user1.props.id, webinarId: webinar.props.id })
            );

            await expect(
                useCase.execute({ webinarId: webinar.props.id, user: user2 })
            ).rejects.toThrow('Le webinar est complet');
        });
    });*/

    describe('Scenario: organizer does not exist', () => {
        it('should throw an error', async () => {
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
    
          await expect(
            useCase.execute({ webinarId: webinar.props.id, user })
          ).rejects.toThrow('Organisateur non trouvé');
        });
      });

});