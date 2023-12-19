import LeadExternal from "../domain/lead-external.repository";

export class LeadCreate {
  private leadExternal: LeadExternal;
  constructor(respositories: [LeadExternal]) {
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
    // console.log(message);

    const resultados: string[] = []; // Ajusta según tu caso, asumo que responseExSave.id es de tipo string
    const arrayPhone: string[] = Array.isArray(phone) ? phone : [phone]; // Convierte a un arreglo si no lo es

    await Promise.all(
      arrayPhone.map(async (phoneNumber) => {
        const responseExSave = await this.leadExternal.sendMsg({ message, phone: phoneNumber });
        // console.log(responseExSave);

        if (responseExSave.id) {

          resultados.push(phoneNumber);
        }
      })
    );
    return {
      "success": true,
      "data": {
        "NumerosEnviados": resultados
      },
      "message": "Mensaje Enviado Correctamente"
    };

  }


  public async recibirGrupos() {
    let chat: any;
    let grupos: any[];

    const responseExSave = await this.leadExternal.getChats();
    // console.log(responseExSave.response);

    if (Array.isArray(responseExSave.response)) {
      // Filtra solo los elementos donde "isGroup" es true
      // grupos = responseExSave.response.filter((chat: { isGroup: boolean}) => (chat.isGroup ));
      // console.log(responseExSave.response);

      grupos = responseExSave.response.filter((chat: { isGroup: boolean }) => (chat.isGroup));


      // console.log(grupos);

      // Mapea el nuevo array para obtener solo las propiedades necesarias
      const gruposFormateados = grupos.map((grupo: { name: string; id: { user: string } }) => ({
        nombre: grupo.name,
        id: grupo.id.user,
      }));

      chat = responseExSave.response[0];

      return {
        success: true,
        data: gruposFormateados,
        message: "Mensaje Enviado Correctamente",
      };
    } else {
      console.error("responseExSave.response no es un array.");
      return {
        success: false,
        data: [],
        message: "Error al obtener grupos",
      };
    }
  }
  public async enviarMensajeGrupos({
    message,
    idGrupo,
  }: {
    message: string;
    idGrupo: string;
  }) {
    // console.log(idGrupo);

    const resultados: string[] = []; // Ajusta según tu caso, asumo que responseExSave.id es de tipo string
    const arrayidGrupo: string[] = Array.isArray(idGrupo) ? idGrupo : [idGrupo]; // Convierte a un arreglo si no lo es

    await Promise.all(
      arrayidGrupo.map(async (idGrupoNumber) => {
        const responseExSave = await this.leadExternal.sendMsgGroup({ message, idGrupo: idGrupoNumber });
        if (responseExSave.id) {
          resultados.push(idGrupoNumber);

        }
      })
    );
    return {
      "success": true,
      "data": {
        "NumerosEnviados": resultados
      },
      "message": "Mensaje Enviado Correctamente"
    };

  }

}
