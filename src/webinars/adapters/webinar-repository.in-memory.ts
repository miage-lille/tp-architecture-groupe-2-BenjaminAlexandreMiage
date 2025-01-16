import { Webinar } from 'src/webinars/entities/webinar.entity';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

export class InMemoryWebinarRepository implements IWebinarRepository {
  constructor(public database: Webinar[] = []) {}
  
  //Permet d'ajouter un webinar
  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }

  //Permet de récupérer le webinar selon son id
  async findById(webinarId: String): Promise<Webinar | null> {
    const webinar = this.database.find(w => w.props.id === webinarId);
    return webinar || null;
  }

}
