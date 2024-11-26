import express from 'express'
import authRoutes from './routes/auth.route.js'
import { connectDB } from './lib/db.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import msgRoutes from './routes/message.route.js'
import {app, io, server} from './lib/socket.js'
import cors from 'cors'
import path from 'path' 


dotenv.config()

// const app = express()

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json(
    {
        limit:"10mb"
    }
))
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.use('/api/auth',authRoutes)
app.use('/api/msg',msgRoutes)


const PORT = process.env.PORT || 5000
const __dirname = path.resolve()    



if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname,'../frontend/dist')))

    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../frontend','dist','index.html'))
    })
}
server.listen(PORT,()=>{
    console.log("server is running on port "+PORT)
    connectDB()
})