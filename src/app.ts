import "dotenv/config"
import express, { response } from "express"
import cors from "cors"
import routes from "./infrastructure/router"

import { Server } from "socket.io";
import { Whatsapp } from "./infrastructure/websocket/whatsapp";

import { readFileSync } from "fs";
import https from "https"; 





const port = process.env.PORT || 3000
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('tmp'))
app.use(express.json({ limit: '50mb' }));

app.use(`/`,routes)
    // Lee los certificados SSL
const key = readFileSync ("./src/private.key.pem");
const cert = readFileSync ("./src/certificate.pem");

// Crea un servidor HTTPS con Express
const server = https.createServer({ key, cert }, app);

// Inicia el servidor HTTPS
server.listen(port, () => {
    console.log(`Servidor HTTPS escuchando en el puerto ${port}`);
});

// Integrate WebSocket
const io = new Server(server);
  
const CHAT_WHATSAPP:any = io.of("/chat/whatsapp");
const CLASS_CHAT_WHATSAPP = new Whatsapp(CHAT_WHATSAPP);
export { CLASS_CHAT_WHATSAPP };

// key: readFileSync ("./ssl/key.pem"),
// cert: readFileSync ("./ssl/cert.pem")
