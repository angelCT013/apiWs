import express, { Router } from "express";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";
const router: Router = Router();

/**
 * http://localhost/lead POST
 */
const leadCtrl: LeadCtrl = container.get("lead.ctrl");
router.post("/", leadCtrl.sendCtrl);
//Funcion para obtener los grupos
router.get("/grupos", leadCtrl.getGrupos);
//Funcion para enviar msj a varios grupos
router.post("/grupos/enviarMsj", leadCtrl.setGruposMsj);

export { router };
