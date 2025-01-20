import { User } from 'src/users/entities/user.entity';

export interface IUserRepository {
  
  //Les méthodes que nous avons besoins :
  findById(id: string): Promise<User | null>;
  save(user: User) : Promise<void>;
}
