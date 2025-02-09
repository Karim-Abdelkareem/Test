import mongoose  from "mongoose";
import dotenv from 'dotenv'
dotenv.config()


let dbUrl = process.env.DB_URL

function DBConnection() {
    mongoose.connect(dbUrl).then(()=>{
        console.log(`Connected To Database Successfully`);
    }).catch((err)=>{
        console.log(err);
        
        console.log(`Cann't Connect To Datebase !`);
        
    })
}
export default DBConnection
