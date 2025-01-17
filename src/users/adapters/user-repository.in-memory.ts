import { User } from "../entities/user.entity";
import { IUserRepository } from "../ports/user-repository.interface";

export class InMemoryUserRepository implements IUserRepository{

    constructor(public database: User[] = []){} 

    async save(user: User): Promise<void> {
        this.database.push(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = this.database.find(u => u.props.id === id);
        return user || null; 
    }

    
} 