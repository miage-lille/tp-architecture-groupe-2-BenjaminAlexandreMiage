import { User } from "../entities/user.entity";
import { IUserRepository } from "../ports/user-repository.interface";

export class InMemoryUserRepository implements IUserRepository{

    constructor(public database: User[] = []){} 

    //Permet de sauvegarder un User
    async save(user: User): Promise<void> {
        this.database.push(user);
    }

    //Permet de récupérer un User selon son ID
    async findById(id: string): Promise<User | null> {
        const user = this.database.find(u => u.props.id === id);
        return user || null; 
    }

    
} 