import { Webinar } from 'src/webinars/entities/webinar.entity';

export interface IWebinarRepository {

  //Les méthodes que nous avons besoins :
  create(webinar: Webinar): Promise<void>;
  findById(webinarId: String): Promise<Webinar | null>;
}
