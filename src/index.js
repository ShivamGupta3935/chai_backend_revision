import dotenv from 'dotenv'
import { app } from './app.js';

import connectToDB from "./db/index.js";
const port = process.env.PORT || 3334
dotenv.config({
    path: './.env'
})

connectToDB()
.then(() => {
   app.listen(port, () => {
     console.log(`App is listening on port ${port}`);
     
   })
})
.catch((err) => {
   console.log("Db connection failed ", err);   
})















/*
(
   async () => {
      try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error",(error) => {
           console.log("express and mongodb connection error", error)
           throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`app is listening on port ${process.env.PORT}`)
        })

      } catch (error) {
        console.error("Error on mongoDb connection", error)
        throw error
      }
   }
)()
   */