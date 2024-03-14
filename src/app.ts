    import "dotenv/config"
    import express from "express"
    import cors from "cors"
    import routes from "./infrastructure/router"
    import { Server } from "socket.io";
    import { Whatsapp } from "./infrastructure/websocket/whatsapp";

    const https = require('https');
    const fs = require('fs');
    
    // Carga los certificados SSL
    const path = require('path');
    const privateKey = fs.readFileSync(path.join(__dirname, 'private.key.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'certificate.pem'), 'utf8');
    // const certificate = fs.readFileSync('certificate.pem');
    
    const credentials = {
        key: privateKey,
        cert: certificate
    };
    
    // Crea un servidor HTTPS con los certificados SSL
    const httpsServer = https.createServer(credentials);

    // const port = 443; // Puerto HTTPS


    const port = process.env.PORT || 443
    const app = express()
    app.use(cors())
    // app.use(express.json())
    app.use(express.json({ limit: '50mb' }));
    app.use(express.static('tmp'))
    app.use(`/`,routes)

    // const server  = app.listen(port, () => console.log(`Ready...${port}`))
    const server = httpsServer.listen(port, () => console.log(`Ready...${port}`));

    // Integrate WebSocket
    const io = new Server(server);
    const CHAT_WHATSAPP:any = io.of("/chat/whatsapp");
    const CLASS_CHAT_WHATSAPP = new Whatsapp(CHAT_WHATSAPP);
    export { CLASS_CHAT_WHATSAPP };
