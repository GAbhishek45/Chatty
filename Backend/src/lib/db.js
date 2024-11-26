import mongoose from "mongoose"
import dotenv from 'dotenv'

dotenv.config()
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongo Connected")
    } catch (error) {
        console.log("Error in DB Connection"+error)
    }
}