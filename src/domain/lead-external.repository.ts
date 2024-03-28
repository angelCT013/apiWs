export default interface LeadExternal {
    sendMsg({message, phone}:{message:string, phone:string}):Promise<any>
    getContactsAll():Promise<any>
    sendMsgGroup({message, idGrupo}:{message:string, idGrupo:string}):Promise<any>
    getMsjChatId({idChat}:{idChat:string}):Promise<any>
    sendAudioMessage({audioData, phone, id_user, id_file_vr, idSerialized}:{audioData:string, phone:string, id_user:number, id_file_vr:number,idSerialized:any}):Promise<any>
    sendFileMessage({fileData, phone, tipo, nombreArchivo, isDocument,id_user,msg,id_file_vr, idSerialized}:{ fileData: string; phone: string; tipo: string; nombreArchivo: string; isDocument:boolean,id_user:number,msg:string,id_file_vr:number,idSerialized:any}):Promise<any>
    setReadMsjWS({idChat}:{idChat:string}):Promise<any>
    setResponseMsjWS({idSerialized,msg}:{idSerialized:string, msg:string}):Promise<any>
    setMsjGeneralSend({idSerialized,msg, idSend, id_usuario, isReplay}:{idSerialized:any, msg:string, idSend:string,id_usuario:string,isReplay:boolean }):Promise<any>


}