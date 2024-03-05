import { Client, LocalAuth  } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";
const { GetData, PostData, PutData, sendAudioMessage} = require('../../utils/api');
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

    this.on('media_uploaded', media => {
      console.log("entro a media");
      
      console.log(media);
      
    });
    this.on("qr", (qr) => {
      console.log("Escanea el codigo QR que esta en la carepta tmp");
      this.generateImage(qr);
    });
  }

      /**
       * Función para manejar los mensajes recibidos
       * @param msg Mensaje recibido
       */
     handleReceivedMessage(msg: WhatsAppMessage) {
        const consolidatedBody = msg.body.replace(/\n/g, ' ');
        const messageToSend = {
          body: consolidatedBody,
          from: msg.from.slice(0, -5),
          type: msg.type,
          author: msg.author ? msg.author.slice(0, -5) :msg.from.slice(0, -5),
          timestamp: msg.timestamp,
          isGroup: msg.from.endsWith('@g.us') ? 1 : 0
        };
        console.log(consolidatedBody);
        
        if(msg.type == 'chat'){

          this.sendMsgTextVR(messageToSend);
        }
        if(msg.type === 'ptt'){
          // console.log(msg);
          this.downloadMediaWS(msg,messageToSend);
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
   * Enviar mensaje recibidos de Whatsapp
   * @param message Mensaje a enviar
   */

      async sendMsgAudioVR(base64Data: string,message : WhatsAppMessage) {
        try {
          let url= `${process.env.API_VR_URL}chat/mensajes/whatsapp/audio`;
          const newMessage = { ...message, base64Data };
          const response = await PostData(url, newMessage);
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
     * !Funcion para descargar el media del msg de Whastapp
     * Temporalmente solo habilitado para audios
     */
  async downloadMediaWS(msg: any,message : WhatsAppMessage){
    const media = await msg.downloadMedia();
    switch (msg.type) {
      case 'ptt':
        const base64Data = media.data;
        this.sendMsgAudioVR(base64Data,message);
        break;
    
      default:
        break;
    }

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
      console.log(response);
      
      return { response };
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
