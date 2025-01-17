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


describe('Feature: BokkSeat', () =>{
    
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

            expect(participationRepository.getDataBase).toHaveLength(1);
        });

    });

});