import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectToDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       // console.log("connection Instance : ", connectionInstance)
        console.log(`\n CONNECTION : DB HOST : ${connectionInstance.connection.host} `);
        
    } catch (error) {
        console.log("Mongo Db connection failed :",error)
        process.exit(1)
    }
}

export default connectToDB;