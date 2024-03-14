export default interface LeadExternal {
    sendMsg({message, phone}:{message:string, phone:string}):Promise<any>
    getContactsAll():Promise<any>
    sendMsgGroup({message, idGrupo}:{message:string, idGrupo:string}):Promise<any>
    getMsjChatId({idChat}:{idChat:string}):Promise<any>
    sendAudioMessage({audioData, phone}:{audioData:string, phone:string}):Promise<any>
    sendFileMessage({fileData, phone, tipo, nombreArchivo, isDocument}:{ fileData: string; phone: string; tipo: string; nombreArchivo: string; isDocument:boolean}):Promise<any>
    setReadMsjWS({idChat}:{idChat:string}):Promise<any>


}