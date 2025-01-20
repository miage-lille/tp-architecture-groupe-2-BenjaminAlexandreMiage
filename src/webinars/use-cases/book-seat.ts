import { request } from 'http';
import { Email, IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { Participation } from '../entities/participation.entity';

type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ webinarId, user }: Request): Promise<Response> {

    //On récupère le webinar dans la base de donnée
    const webinar = await this.webinarRepository.findById(webinarId);

    //On vérifie qu'il existe
    if(webinar===null){
      throw new Error('Webinar non trouvé');
    }

    //On récupère la liste des participations à ce webinar
    const participationWebinar = await this.participationRepository.findByWebinarId(webinarId);
    
    //On vérifie si le user participe déjà au webinar
    const participe = await participationWebinar.some(part => part.props.userId === user.props.id);

    if(participe){
      throw new Error('L\'utilisateur participe déjà à ce webinar');
    }
    
    //On vérifie s'il y a encore de la place dans le webinar
    if(webinar.hasNotEnoughSeats()){
      throw new Error('Le webinar est complet');
    }

    //On enregistre la paricipation de l'user
    const userId = user.props.id;

    const participation = new Participation({
      userId,
      webinarId
    });

    await this.participationRepository.save(participation);
    //On mets à jours le webinar
    webinar.addUser();
    
    
    //On récupère l'organisateur 
    const orga = await this.userRepository.findById(webinar.props.organizerId);

    if (orga === null) {
      throw new Error('Organisateur non trouvé');
    }

    //On crée le mail
    const email : Email = {
      to: orga.props.email,
      subject: `Nouvelle inscription au webinar`,
      body: `Bonjour, un nouvel utilisateur s'est inscrit à votre webinar`
    };

    //On envoie un e-mail à l'organisateur
    await this.mailer.send(email);

    return;
  }
}
