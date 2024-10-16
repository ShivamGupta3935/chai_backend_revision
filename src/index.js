import dotenv from 'dotenv'

import mongoose from "mongoose";
import {DB_NAME} from './constants.js'
import express from "express";
const app = express()
import connectToDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

connectToDB();















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