import { Request, Response } from "express";
import { LeadCreate } from "../../application/lead.create";


class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async ({ body }: Request, res: Response) => {
    const { message, phone } = body;
    console.log(body);
    
    const response = await this.leadCreator.sendMessageAndSave({ message, phone })
   let resp= res.send(response);
    
  };
  public getGrupos = async (req: Request, res: Response) => {

    const response = await this.leadCreator.recibirGrupos()

    res.send(response);
  };

  public setGruposMsj = async ({ body }: Request, res: Response) => {
    const { message, idGrupo } = body;

    const response = await this.leadCreator.enviarMensajeGrupos({ message, idGrupo })
    res.send(response);
  };

  public getChatId = async ({ body }: Request, res: Response) => {
    const { idChat } = body;
    console.log(idChat);
    
    const response = await this.leadCreator.getMsjChat({ idChat })
    res.send(response);
  };
  public getContactos = async (req: Request, res: Response) => {
    
    const response = await this.leadCreator.recibirChats()

    res.send(response);
  };

}

export default LeadCtrl;
