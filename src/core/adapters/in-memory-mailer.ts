import { Email, IMailer } from 'src/core/ports/mailer.interface';

export class InMemoryMailer implements IMailer {

  public readonly sentEmails: Email[] = [];

  //Permet d'ajouter à sentEmails l'Email
  async send(email: Email): Promise<void> {
    this.sentEmails.push(email);
  }

  //Permet de récupérer la liste sentEmails
  async getEmails(): Promise<Email[]> {
    return this.sentEmails;
  }

}
