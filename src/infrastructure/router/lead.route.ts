import express, { Router } from "express";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";
const router: Router = Router();

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get("lead.ctrl");
router.post("/", leadCtrl.sendCtrl);
//Api para obtener los grupos
router.get("/grupos", leadCtrl.getGrupos);
//Api para enviar msj a varios grupos
router.post("/grupos/enviarMsj", leadCtrl.setGruposMsj);

//Api para ver el chat
router.post("/chats/viewChat", leadCtrl.getChatId);

//Api para obtener contactos
router.get("/contactos", leadCtrl.getContactos);

//Api para enviar audios
router.post("/envio/multimedia/audio", leadCtrl.setAudioMsj);

//Api para enviar archivos
router.post("/envio/multimedia/file", leadCtrl.setFileMsj);



export { router };
