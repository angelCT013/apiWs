export default interface LeadExternal {
    sendMsg({message, phone}:{message:string, phone:string}):Promise<any>
    getChats():Promise<any>
    sendMsgGroup({message, idGrupo}:{message:string, idGrupo:string}):Promise<any>
}