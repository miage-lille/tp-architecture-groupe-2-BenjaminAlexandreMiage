export type Email = {
  to: string;
  subject: string;
  body: string;
};

export const I_MAILER = 'I_MAILER';
export interface IMailer {

  //Les méthodes que nous avons besoins :
  send(props: Email): Promise<void>;
  getEmails() : Promise<Email[] >;
}
