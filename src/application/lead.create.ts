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

    const resultados: string[] = []; 
    const arrayPhone: string[] = Array.isArray(phone) ? phone : [phone]; 

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

    const responseExSave = await this.leadExternal.getContactsAll();
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

    const resultados: string[] = []; 
    const arrayidGrupo: string[] = Array.isArray(idGrupo) ? idGrupo : [idGrupo]; 

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
  public async getMsjChat({
    idChat,
  }: {
    idChat: string;
  }) {
    // console.log(idChat);

    const resultados: string[] = []; 
    const arrayidChat: string[] = Array.isArray(idChat) ? idChat : [idChat]; 

    await Promise.all(
      arrayidChat.map(async (idChatNumber) => {
        const responseExSave = await this.leadExternal.getMsjChatId({ idChat: idChatNumber });
        if (responseExSave) {
          resultados.push(responseExSave);

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

  public async recibirChats() {
    let chat: any;
    let grupos: any[];
    let contactos: any[];

    const responseExSave = await this.leadExternal.getContactsAll();
    // console.log(responseExSave.response);

    if (Array.isArray(responseExSave.response)) {

      grupos = responseExSave.response.filter((chat: { isGroup: boolean }) => (chat.isGroup));
      // contactos = responseExSave.response.filter((chat: { isMyContact: boolean }) => (chat.isMyContact));
      contactos = responseExSave.response.filter((chat: { isMyContact: boolean; id: { server: string } }) => (
        chat.isMyContact && chat.id.server === 'c.us'
      ));

      const gruposFormateados = grupos.map((grupo: { name: string; id: { user: string } }) => ({
        nombre: grupo.name,
        id: grupo.id.user,
        tipo:2,
        nameTipo: 'Grupo'
      }));
      // console.log(contactos);
      
      const contactosFormateados = contactos.map((usuario: { name: string; id: { user: string } }) => ({
        nombre: usuario.name,
        id: usuario.id.user,
        tipo:1,
        nameTipo: 'Usuario'
      }));
      const resultadosFormateados = [...gruposFormateados, ...contactosFormateados];

      return {
        success: true,
        data: resultadosFormateados,
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
  public async enviarAudiosMsj({
    audioData,
    idPhone,
    isGroup,
    id_user, 
    id_file_vr,
    idSerialized
  }: {
    audioData: string;
    idPhone: string;
    isGroup:boolean;
    id_user: number; 
    id_file_vr: number;
    idSerialized:any;
  }) {

    const tipo = isGroup ? '@g.us':'@c.us';
    let idSend = idPhone+tipo;
    const responseExSave = await this.leadExternal.sendAudioMessage({ audioData, phone: idSend,id_user, id_file_vr,idSerialized });

    console.log(responseExSave);

    return {
      "success": true,
      "data": responseExSave,
      "message": "Mensaje Enviado Correctamente"
    };

  }
  public async enviarArchivosMsj({
    fileData,
    idPhone,
    isGroup,
    tipo,
    nombreArchivo,
    isDocument,
    id_user, 
    msg, 
    id_file_vr,
    idSerialized
  }: {
    fileData: string;
    idPhone: string;
    isGroup:boolean;
    tipo:string;
    nombreArchivo:string;
    isDocument:boolean;
    id_user:number; 
    msg:string; 
    id_file_vr:number;
    idSerialized:any;

  }) {

    const tipoSend = isGroup ? '@g.us':'@c.us';
    let idSend = idPhone+tipoSend;
    
    const responseExSave = await this.leadExternal.sendFileMessage({ fileData, phone: idSend,tipo,nombreArchivo,isDocument,id_user,msg,id_file_vr,idSerialized});
    console.log(responseExSave);
    
    return {
      "success": true,
      "data": responseExSave,
      "message": "Mensaje Enviado Correctamente"
    };

  }

  public async setMarkReadMsjWS({
    idChat,
  }: {
    idChat: string;
  }) {
    // console.log(idChat);

    const resultados: string[] = []; 
    const arrayidChat: string[] = Array.isArray(idChat) ? idChat : [idChat]; 

    await Promise.all(
      arrayidChat.map(async (idChatNumber) => {
        const responseExSave = await this.leadExternal.setReadMsjWS({ idChat: idChatNumber });
        if (responseExSave) {
          resultados.push(responseExSave);

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

  public async setResponderMsgWS({
    idSerialized,
    msg
  }: {
    idSerialized: string;
    msg: string;
  }) {

    const resultados: string[] = []; 

        const responseExSave = await this.leadExternal.setResponseMsjWS({ idSerialized: idSerialized, msg:msg });
        if (responseExSave) {
          resultados.push(responseExSave);

        }
    return {
      "success": true,
      "data": {
        "NumerosEnviados": resultados
      },
      "message": "Mensaje Enviado Correctamente"
    };

  }

  public async setMsgGeneralWS({
    idSerialized,
    msg,
    isGroup,
    id_usuario,
    isReplay,
    id_chat
  }: {
    idSerialized: any;
    msg: string;
    isGroup: boolean;
    id_usuario: string;
    isReplay: boolean;
    id_chat: string;

  }) {

    const tipoSend = isGroup ? '@g.us':'@c.us';
    let idSend = id_chat+tipoSend;
        const responseExSave = await this.leadExternal.setMsjGeneralSend({ idSerialized: idSerialized, msg:msg, idSend:idSend,id_usuario:id_usuario, isReplay:isReplay  });

    return {
      "success": true,
      "data": responseExSave,
      "message": "Mensaje Enviado Correctamente"
    };

  }

}
