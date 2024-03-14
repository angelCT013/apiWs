import { Client, LocalAuth, MessageMedia, MessageSendOptions   } from "whatsapp-web.js";
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
  type: string;
  author?: string;
  timestamp: number;
  _data?: {
    _attachments?: [{ data: string }];
  };

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
      console.log("LOGIN_SUCCESS");
    });

    this.on("auth_failure", () => {
      this.status = false;
      console.log("LOGIN_FAIL");
    });

    this.on('message', msg => {
      // console.log(msg);
      this.handleReceivedMessage(msg);
      
    });

    this.on('unread_count', unread => {
      
      console.log(unread);
      
    });

    // this.on('media_uploaded', media => {
    //   console.log("entro a media");
      
    //   // console.log(media);
      
    // });
    this.on("qr", (qr) => {
      console.log("Escanea el codigo QR que esta en la carepta tmp");
      this.generateImage(qr);
    });
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
        }

        const messageToSend:dataMessage = {
          body: consolidatedBody,
          from: msg.from.slice(0, -5),
          type: msg.type,
          author: msg.author ? msg.author.slice(0, -5) :msg.from.slice(0, -5),
          timestamp: msg.timestamp,
          isGroup: msg.from.endsWith('@g.us') ? 1 : 0
        };
        // console.log(messageToSend);
        // console.log(msg);
        
        let data:any;
        
        switch (msg.type) {
          case 'chat':
            this.sendMsgTextVR(messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessage(messageToSend)
            break;
          case 'ptt':
            data = await this.downloadMediaWS(msg,messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data?.data,"ptt")
            break;
          case "audio":
            data = await this.downloadMediaWS(msg,messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data?.data,"audio")

          break;
          case "image":
            data = await this.downloadMediaWS(msg,messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data?.data,"image")
          break;
          case "document":
            data = await this.downloadMediaWS(msg,messageToSend);
            CLASS_CHAT_WHATSAPP.communicateMessageType(messageToSend,data?.data,"document")
          break;
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
          console.log(response.data);
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
          console.log({
            data:response,
            message:newMessage
          });
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
          data=this.sendFilesVR(base64Data,message,mimetype);
        break;
        // case 'audio':
        //   base64Data = media.data;
        //   data=this.sendFilesVR(base64Data,message);
        //   break;
        case 'image':
          console.log(media);
          
          base64Data = media.data;
          mimetype = media.mimetype;
            data=this.sendFilesVR(base64Data,message,mimetype);
          break;
          case 'document':
            console.log(media);
            
            base64Data = media.data;
            mimetype = media.mimetype;
              data=this.sendFilesVR(base64Data,message,mimetype);
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
      
      return { id: response.id.id };
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
