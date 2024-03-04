export default interface LeadExternal {
    sendMsg({message, phone}:{message:string, phone:string}):Promise<any>
    getContactsAll():Promise<any>
    sendMsgGroup({message, idGrupo}:{message:string, idGrupo:string}):Promise<any>
    getMsjChatId({idChat}:{idChat:string}):Promise<any>
}