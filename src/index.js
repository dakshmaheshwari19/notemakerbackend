import { app } from "./app.js";

import dotenv from "dotenv"
dotenv.config({
    path:'./'
})

import connectDB from "./db/index.js";

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("errr : ",error);
        throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("mongoDB connect failed :",err);
})