import express, { Router } from "express";
import LeadCtrl from "../controller/messagegroup.ctrl";
import container from "../ioc";
const router: Router = Router();

/**
 * http://localhost/messagegroup POST
 */
const leadCtrl: LeadCtrl = container.get("lead.ctrl");
router.post("/", leadCtrl.sendCtrl);

export { router };
