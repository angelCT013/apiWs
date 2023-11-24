import { Client, LocalAuth } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";
import { Browser } from 'puppeteer';
/**
 * Extendemos los super poderes de whatsapp-web
 */
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

    this.on("qr", (qr) => {
      console.log("Escanea el codigo QR que esta en la carepta tmp");
      this.generateImage(qr);
    });
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
      await this.sendMessage(`${phone}@c.us`, message).then(async (response)=>{
        if (response.id.id != '') {
          // Cerrar el navegador si response tiene datos
          // console.log("entro al if");
          // console.log(response);
          
          await this.closeBrowser();
        }
        return { id: response.id.id};
      });

    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
    /**
   * Enviar mensaje de WS
   * @param lead/group
   * @returns
   */
  async sendMsgGroup(lead: { message: string; idGroup: string }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
      const { message, idGroup } = lead;
      const response = await this.sendMessage(`${idGroup}@g.us`, message);
      // const chats = await this.getChats();
      return { id: response.id.id};
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

  /**
   * Cierra el navegador
   */
     async closeBrowser() {
      if (this.pupBrowser) {
        await this.pupBrowser.close();
      }
    }
}

export default WsTransporter;
