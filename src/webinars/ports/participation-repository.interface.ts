import { Participation } from 'src/webinars/entities/participation.entity';

export interface IParticipationRepository {

  //Les méthodes que nous avons besoins :   
  getDataBase() : Promise<Participation[]>;
  findByWebinarId(webinarId: string): Promise<Participation[]>;
  save(participation: Participation): Promise<void>;
}
