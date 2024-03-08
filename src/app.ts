    import "dotenv/config"
    import express from "express"
    import cors from "cors"
    import routes from "./infrastructure/router"

    import { Server } from "socket.io";
    import { Whatsapp } from "./infrastructure/websocket/whatsapp";

    const port = process.env.PORT || 3000
    const app = express()
    app.use(cors())
    app.use(express.json())
    app.use(express.static('tmp'))
    app.use(`/`,routes)

    const server  = app.listen(port, () => console.log(`Ready...${port}`))

    // Integrate WebSocket
    const io = new Server(server);
    const CHAT_WHATSAPP:any = io.of("/chat/whatsapp");
    const CLASS_CHAT_WHATSAPP = new Whatsapp(CHAT_WHATSAPP);
    export { CLASS_CHAT_WHATSAPP };
