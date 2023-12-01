import { Request, Response } from "express";
import { LeadCreate } from "../../application/lead.create";


class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async ({ body }: Request, res: Response) => {
    const { message, phone } = body;

    const response = await this.leadCreator.sendMessageAndSave({ message, phone })
   let resp= res.send(response);
    if(resp){
      await this.leadCreator.closeLastPage();

    }
  };
}

export default LeadCtrl;
