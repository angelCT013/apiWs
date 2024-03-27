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

  public setAudioMsj = async ({ body }: Request, res: Response) => {
    const { audioData, idPhone, isGroup } = body;

    const response = await this.leadCreator.enviarAudiosMsj({ audioData, idPhone, isGroup })
    res.send(response);
  };
  public setFileMsj = async ({ body }: Request, res: Response) => {
    
    const { fileData, idPhone, isGroup, tipo, nombreArchivo, isDocument } = body;

    const response = await this.leadCreator.enviarArchivosMsj({ fileData, idPhone, isGroup, tipo, nombreArchivo, isDocument })
    res.send(response);
  };

  public setMarkReadWS = async ({ body }: Request, res: Response) => {
    const { idChat } = body;
    // console.log(idChat);
    
    const response = await this.leadCreator.setMarkReadMsjWS({ idChat })
    res.send(response);
  };

  
  public setResponseWS = async ({ body }: Request, res: Response) => {
    const { idSerialized, msg } = body;
    
    const response = await this.leadCreator.setResponderMsgWS({ idSerialized, msg })
    res.send(response);
  };

  public setMensajesGeneralWS = async ({ body }: Request, res: Response) => {
    const { idSerialized, msg, isGroup, id_usuario, isReplay, id_chat } = body;
    
    const response = await this.leadCreator.setMsgGeneralWS({ idSerialized, msg, isGroup, id_usuario, isReplay, id_chat })
    res.send(response);
  };

}



export default LeadCtrl;
