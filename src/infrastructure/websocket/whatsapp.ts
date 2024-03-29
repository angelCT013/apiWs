import { format } from "date-fns";
import { Server, Socket } from "socket.io";
// interface dataMessage {
//   id_chat: string,
//   mensaje: string,
//   numero: string,
//   fecha_msj: string,
//   nombre_contacto: string,
//   tipo: number,
//   id_origen: string,
//   origen: number,
//   updated_at: string,
//   created_at: string,
//   id: number
// }
interface dataMessage{
  body:string,
  from:string,
  type:string,
  author:string,
  timestamp:number,
  isGroup:number,
  nameWs:string
}
interface statusSession{
  status:boolean,
  message:string
}
export class Whatsapp{
  private chat: Server;
  private session_whatsapp:statusSession={
    status:false,
    message:'Sesión No Iniciada'
  };

  constructor(main: Server) {
    this.chat = main;
    

    this.events();


  }

  public setSessionWhatsapp(status:statusSession){
    this.session_whatsapp=status
  }


  public communicateStatusSession(data:statusSession):void{    
    this.chat.emit("status_session",data);
  }

  public communicateMessage(data:dataMessage): void {

    const formattedDate = format(new Date(data.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss');
    const message={
      data:data,
      message:{
        message:data.body,
        time:formattedDate,
        senderId:null,
        feedback:{
          isSent:true,
          isDelivered:true,
          isSeen:true
        },
        origen :{
          estatus : 2,
          nombre : data.nameWs,
          numero : data.author,
          id_usuario : null,
        },

        id_archivo:null,
        nombre_archivo:null,
        multimedia:0,
        extension:null,
        tipo_multimedia:null,
      }
    }

    console.log(message);
    
    this.chat.emit("message", message);


  }
  public communicateMessageType(data:dataMessage,file:{id:number,nombre_archivo:string,extension:string},type:string): void {
    
    const formattedDate = format(new Date(data.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss');
    // const formattedDate = data.timestamp;
    console.log(file);
    

    let multimedia = {}

    switch(type){
      case 'ptt':
      multimedia={tipo_multimedia:'audio'}
      break;
      case 'image':
      multimedia={tipo_multimedia:'image'}
      break;
      case 'document':
        multimedia={tipo_multimedia:'file'}
      break;
    }



    this.chat.emit("message", {
      data:data,
      message:{
        message:data.body,
        time:formattedDate,
        senderId:null,
        feedback:{
          isSent:true,
          isDelivered:true,
          isSeen:true
        },
        origen :{
          estatus : 2,
          nombre : data.nameWs,
          numero : data.author,
          id_usuario : null,
        },
          id_archivo:file.id,
          nombre_archivo:file.nombre_archivo,
          multimedia:1,
          extension:file.extension,
          ...multimedia
      }
    });


  }

  private events(): void {
    this.chat.on("connection", (socket: Socket) => {
      const username: string = socket?.handshake?.auth?.username;
      
      console.log({
        text:`Usuario Conectado ${username}`,
      });


      /**
       * ?Envío de mensajes para transmitir a los demás usuarios
       */
      socket.on("message", (arg: any) => {
        this.chat.emit("message", arg);
        
      });

      socket.on("get_status_session", (arg: any) => {
        this.communicateStatusSession(this.session_whatsapp)
      })

      socket.on("message_test", (arg: any) => {
        
        
        
        this.chat.emit("message", 
        {
          data: {
            body: '123',
            from: '5216647116804',
            type: 'chat',
            author: '5216647116804',
            timestamp: 1709840497,
            isGroup: 0
          },
          message: {
            message: '123',
            time: '2024-03-07 11:41:37',
            senderId: null,
            feedback: { isSent: true, isDelivered: true, isSeen: true },
            
            id_archivo: null,
            nombre_archivo: null,
            multimedia: 0,
            extension:null,
            tipo_multimedia: null
          }
        });
        
      });
      /**
       * Desconexión del usuario
       */
      socket.on("disconnect", () => {
      
        console.log({
          text:`Usuario Desconectado ${username}`,
        });

      });
    });
  }
}
