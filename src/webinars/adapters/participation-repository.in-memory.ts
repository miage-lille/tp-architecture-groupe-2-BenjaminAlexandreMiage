import { Participation } from "../entities/participation.entity";
import { IParticipationRepository } from "../ports/participation-repository.interface" ;

export class InMemoryParticipationRepository implements IParticipationRepository{

    constructor(public database: Participation[] = [] ){} 

    async findByWebinarId(webinarId: string): Promise<Participation[]> {
        return this.database.filter(w => w.props.webinarId === webinarId);
    }

    async save(participation: Participation): Promise<void> {
        this.database.push(participation);
    }

    async getDataBase(): Promise<Participation[]>{
        return this.database;
    }  
    
} 