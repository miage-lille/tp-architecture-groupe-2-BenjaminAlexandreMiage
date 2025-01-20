import { Participation } from "../entities/participation.entity";
import { IParticipationRepository } from "../ports/participation-repository.interface" ;

export class InMemoryParticipationRepository implements IParticipationRepository{

    constructor(public database: Participation[] = [] ){} 

    //Méthode pour récupérer la liste des participations à un webinar
    async findByWebinarId(webinarId: string): Promise<Participation[]> {
        return this.database.filter(w => w.props.webinarId === webinarId);
    }

    //Méthode pour enregister la participation
    async save(participation: Participation): Promise<void> {
        this.database.push(participation);
    }

    //Méthode pour récupérer la liste qui gère les participations
    async getDataBase(): Promise<Participation[]> {
        return this.database;
    }
     
    
} 