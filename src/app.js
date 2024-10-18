import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))
app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({
  limit:"16kb",
  extended: true
}))
app.use(express.static('public'))
app.use(cookieParser())

//router import
import router from "./routes/user.routes.js";

//routes 
app.use('/api/v1/users', router)

//http://localhost:8000/api/v1/users


export {app}