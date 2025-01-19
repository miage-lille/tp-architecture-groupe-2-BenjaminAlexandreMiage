import { Participation } from 'src/webinars/entities/participation.entity';

export interface IParticipationRepository {
  getDataBase() : Promise<Participation[]>;
  findByWebinarId(webinarId: string): Promise<Participation[]>;
  save(participation: Participation): Promise<void>;
}
