import LeadExternal from "../domain/lead-external.repository";

export class LeadCreate {
  private leadExternal: LeadExternal;
    constructor(respositories: [ LeadExternal]) {
    const [leadExternal] = respositories;
    this.leadExternal = leadExternal;
  }

  public async sendMessageAndSave({
    message,
    phone,
  }: {
    message: string;
    phone: string;
  }) {
    // console.log(phone);
    
    const resultados: string[] = []; // Ajusta según tu caso, asumo que responseExSave.id es de tipo string
    const arrayPhone: string[] = Array.isArray(phone) ? phone : [phone]; // Convierte a un arreglo si no lo es
    
    await Promise.all(
      arrayPhone.map(async (phoneNumber) => {
        const responseExSave = await this.leadExternal.sendMsg({ message, phone: phoneNumber });
        // console.log(responseExSave);
        
        if(responseExSave.id){
          
          resultados.push(phoneNumber);
          await this.leadExternal.closeBrowser();
        }
      })
    );
    return {
      "success": true,
      "data":{
        "NumerosEnviados":resultados
      },
      "message":"Mensaje Enviado Correctamente"
    };

  }

}
