import { Client, LocalAuth, MessageMedia, MessageSendOptions, Message, MessageAck } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";
import { CLASS_CHAT_WHATSAPP } from "../../app";
const { GetData, PostData, PutData} = require('../../utils/api');
// import { GetData } from "../../utils/api"
/**
 * Extendemos los super poderes de whatsapp-web 
 */

interface WhatsAppMessage {
  body: string;
  from: string;
  to: string;
  type: string;
  author?: string;
  timestamp: number;
  _data?: {
    _attachments?: [{ data: string }];
    notifyName?: string; 
  };
  id?:{
    id:string;
    _serialized:string;

  }

}

interface dataBody{
  origen:number,
  from:string
}
interface statusSessionConexion{
  status:boolean,
  message:string
}

class WsTransporter extends Client implements LeadExternal {
  private status = false;
  constructor() {
    super({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          "--disable-setuid-sandbox",
          "--unhandled-rejections=strict",
        ],
      },
      webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2407.3.html`,
    },
    });

    
    console.log("Iniciando....");

    this.initialize();

    this.on("ready", () => {
      
      this.status = true;

      this.setStatusConexion({
        status:true,
        message:"Sesión Iniciada Correctamente"
      })
      
      console.log("LOGIN_SUCCESS");

    });

    this.on("disconnected", () => {

      this.status = false;

      this.setStatusConexion({
        status:false,
        message:"Sesión Cerrada"
      })

      console.log("DISCONNECTED");

    });

    this.on("auth_failure", () => {

      this.status = false;

      this.setStatusConexion({
        status:false,
        message:"Error al Iniciar Sesión"
      })

      console.log("LOGIN_FAIL");
    });

    this.on('message', msg => {
      // console.log(msg);
      this.handleReceivedMessage(msg);
      
    });
    /**
     * Evento para cuando yo abro la conversacion desde WS
     * 
     */
    this.on('unread_count', unread => {
      
      if(unread.unreadCount===0){
        // console.log(unread.unreadCount);
      this.handleReceivedRead(unread.id.user, 2);

      }
    });


    this.on('message_ack', (message, ack) => {

      this.handleReceivedAck(message, ack);
    
    });

    // this.on('media_uploaded', media => {
    //   console.log("entro a media");
      
    //   // console.log(media);
      
    // });
    this.on("qr", (qr) => {
      console.log("Escanea el codigo QR que esta en la carpeta tmp");
      this.generateImage(qr);
    });

  }

  setStatusConexion(statusSession:statusSessionConexion){
    
    CLASS_CHAT_WHATSAPP.setSessionWhatsapp(statusSession)
    CLASS_CHAT_WHATSAPP.communicateStatusSession(statusSession)

  }
       /**
       * Función para manejar el atributo ack
       * ACK_ERROR  : -1
       * ACK_PENDING:  0
       * ACK_SERVER :  1
       * ACK_DEVICE :  2
       * ACK_READ   :  3
       * ACK_PLAYED :  4
       * @param msg Mensaje recibido
       */
          /**

     */
       async handleReceivedAck(message: Message, ack: MessageAck) {

        switch (ack) {
          case 3:
            // console.log(message.id.fromMe);
            // console.log(message.id.remote);
            // console.log("Este es el valor de ack: "+ack);
            if(message.id.fromMe){
              this.handleReceivedRead(message.id.remote.slice(0, -5), 1);

            }

            break;
        
          default:
            break;
        }
       }

      /**
       * Función para manejar los mensajes recibidos
       * @param msg Mensaje recibido
       */
     async handleReceivedMessage(msg: WhatsAppMessage) {
      

        const consolidatedBody = msg.body.replace(/\n/g, ' ');

        interface dataMessage{
          body:string,
          from:string,
          type:string,
          author:string,
          timestamp:number,
          isGroup:number,
          nameWs:string,
          to:string,
          idMsg:string,
          serialized:string
        }

        let nameWS = '';
          if (msg._data && msg._data.notifyName) {
              nameWS = msg._data.notifyName;
          }
          let idMsg = '';
          let serialized = '';
          if (msg.id) {
            idMsg =  msg.id.id;
            serialized = msg.id._serialized;
          }

        const messageToSend:dataMessage = {
          body: consolidatedBody,
          from: msg.from.slice(0, -5),
          type: msg.type,
          author: msg.author ? msg.author.slice(0, -5) :msg.from.slice(0, -5),
          timestamp: msg.timestamp,
          isGroup: msg.from.endsWith('@g.us') ? 1 : 0,
          nameWs: nameWS,
          to: msg.to.slice(0, -5),
          idMsg: idMsg,
          serialized: serialized
        };
        console.log(messageToSend);
        // console.log(msg.author);

        if(msg.author=='5216642267086@c.us' ||msg.author=='5216161226168@c.us'||msg.from=='5216161226168@c.us'){
          // console.log("entro aqui");
          
          const replayMsg ={
            idSerialized:serialized,
            msg:consolidatedBody
          }
          this.setResponseMsjWS(replayMsg);

        }
        
        let data:any;

        switch (msg.type) {
          case 'chat':

            this.sendMsgTextVR(messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessage(messageToSend)
            break;
          case 'ptt':
            data = await this.downloadMediaWS(msg,messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data,"ptt")
            break;
            //NO DESCOMENTAR
          // case "audio":
          //   data = await this.downloadMediaWS(msg,messageToSend);
          //   CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data,"audio")

          // break;
          case "image":
            data = await this.downloadMediaWS(msg,messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data,"image")
          break;
          case "document":
            data = await this.downloadMediaWS(msg,messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data,"document")
          break;
        }



      }



  /**
   * Notificar a vr sobre los mensajes leidos
   * @param message Mensaje a enviar
   */
        async handleReceivedRead(from: string, origen:number) {
        

          try {
            // console.log(message);
            let url= `${process.env.API_VR_URL}chat/mensajes/markRead`;
            const body:dataBody = {
              origen: origen,
              from: from,
            };
            const response = await PostData(url, body);
            // console.log(response.data);
          } catch (error) {
            if (error instanceof Error) {
              console.error('Error al enviar el mensaje :', error.message);
            } else {
              console.error('Error desconocido al enviar el mensaje');
            }
          }
        }
  /**
   * Enviar mensaje recibidos de Whatsapp
   * @param message Mensaje a enviar
   */
       async sendMsgTextVR(message: WhatsAppMessage) {
        try {
          // console.log(message);
          let url= `${process.env.API_VR_URL}chat/mensajes/whatsapp`;

          const response = await PostData(url, message);
          // console.log(response.data);
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error al enviar el mensaje :', error.message);
          } else {
            console.error('Error desconocido al enviar el mensaje');
          }
        }
      }
    /**
   * Enviar mensaje de audio recibidos de Whatsapp
   * @param message Mensaje a enviar
   */

      async sendFilesVR(base64Data: string,message : WhatsAppMessage,mimetype: string) {
        try {
          let url= `${process.env.API_VR_URL}chat/mensajes/whatsapp/files`;
          const newMessage = { ...message, base64Data,mimetype };
          const response = await PostData(url, newMessage);
          // console.log({
          //   data:response,
          //   message:newMessage
          // });
          // console.log(response.data);
          
          return response.data
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error al enviar el mensaje :', error.message);
          } else {
            console.error('Error desconocido al enviar el mensaje');
          }
        }
      }

    /**
     * !Funcion para descargar el media del msg de Whastapp
     * Temporalmente solo habilitado para audios
     */
  async downloadMediaWS(msg: any,message : WhatsAppMessage){
    const media = await msg.downloadMedia();
    
    let data,base64Data, mimetype;
    
    switch (msg.type) {
      case 'ptt':
        base64Data = media.data;
        mimetype = media.mimetype;
          data=await this.sendFilesVR(base64Data,message,mimetype);
        break;
        // case 'audio':
        //   base64Data = media.data;
        //   data=this.sendFilesVR(base64Data,message);
        //   break;
        case 'image':
          // console.log(media);
          
          base64Data = media.data;
          mimetype = media.mimetype;
            data=await this.sendFilesVR(base64Data,message,mimetype);
            // console.log(data);
            
          break;
          case 'document':
            // console.log(media);
            
            base64Data = media.data;
            mimetype = media.mimetype;
              data=await this.sendFilesVR(base64Data,message,mimetype);
            break;
      default:
        break;
    }

    return data
  }

  /**
   * Enviar mensaje de WS
   * @param lead
   * @returns
   */
  async sendMsg(lead: { message: string; phone: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const { message, phone } = lead;
      const response = await this.sendMessage(`${phone}@c.us`, message);
      // console.log(response);
      
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async getContactsAll(): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const response = await this.getContacts();
      return { response };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async sendMsgGroup(lead: { message: string; idGrupo: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const { message, idGrupo } = lead;
      const response = await this.sendMessage(`${idGrupo}@g.us`, message);
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
  async getMsjChatId(lead: {idChat: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const { idChat } = lead;
      const response = await this.getChatById(`${idChat}@g.us`);
      // console.log(response);
      
      return { response };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
  async sendAudioMessage(lead: { audioData: string; phone: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "ERROR AL MANDAR AUDIO (WHATSAPP)" });
  
      const { audioData, phone } = lead;
  
      // Crear una instancia de MessageMedia con el contenido de audio PTT
      const audioMedia = new MessageMedia('audio/ogg; codecs=opus', audioData, 'audio.ogg');
      // console.log(audioMedia);
      
      const options: MessageSendOptions = {
        linkPreview: false, 
        sendAudioAsVoice: true 
      };
      // console.log(phone);
      // console.log(options);
      
      // Enviar el mensaje con el contenido de audio adjunto
      const response = await this.sendMessage(`${phone}`, audioMedia, options);
      // console.log(response);
      // const result={
      //   serialized:response.id._serialized,
      //   messageId:response.id.id,
      //   userId:response.from.slice(0, -5)
      // };
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async sendFileMessage(lead: { fileData: string; phone: string; tipo: string; nombreArchivo: string; isDocument:boolean }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "ERROR AL MANDAR ARCHIVO (WHATSAPP)" });
  
      const { fileData, phone,tipo, nombreArchivo,isDocument } = lead;
  
      const dataMedia = new MessageMedia(tipo, fileData, nombreArchivo);
      // console.log(dataMedia);
      
      const options: MessageSendOptions = {
        linkPreview: true
      };
         // Verificar si el archivo es un documento
      if (isDocument) {
          options.sendMediaAsDocument = true;
      }
      
      

      // Enviar el mensaje con el contenido de audio adjunto
      const response = await this.sendMessage(`${phone}`, dataMedia, options);
      // console.log(response);

      const result={
        serialized:response.id._serialized,
        messageId:response.id.id,
        userId:response.from.slice(0, -5)
      };
      
      return result;
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
  async setReadMsjWS(lead: {idChat: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "ERROR AL MARCAR MSJ COMO VISTOS" });
      const { idChat } = lead;

      const response = await this.sendSeen(idChat);
      // console.log(idChat);
      // console.log(response);
      
      return { response };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
  async setResponseMsjWS(lead: {idSerialized: string, msg: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "ERROR AL RESPONDER UN MSJ" });
      const { idSerialized, msg } = lead;

      const response = await this.getMessageById(idSerialized);

      response.reply(msg);
      // console.log(idChat);
      console.log({ id: response.id.id });
      return { id: response.id.id };
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  async setMsjGeneralSend(lead: {idSerialized:any, msg:string, idSend:string,id_usuario:string,isReplay:boolean }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "ERROR AL ENVIAR UN MSJ" });
      const { idSerialized, msg,idSend,id_usuario,isReplay } = lead;
      let response;
      if(isReplay){
        const responseSerilazed = await this.getMessageById(idSerialized);
        response= await responseSerilazed.reply(msg);

      }else{
       response = await this.sendMessage(`${idSend}`, msg);

      }
      const result={
        serialized:response.id._serialized,
        messageId:response.id.id,
        userId:response.from.slice(0, -5)
      };
      // console.log(response);
      return  result;
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }

  getStatus(): boolean {
    return this.status;
  }

  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/tmp`;
    let qr_svg = imageQr(base64, { type: "svg", margin: 4 });
    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}

export default WsTransporter;
