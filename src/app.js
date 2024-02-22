import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

//config middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
// declare routes
import userRouter from './routes/user.routes.js'
app.use("/api/v1/users",userRouter)

import noteRouter from './routes/notes.routes.js'
app.use("/api/v1/notes",noteRouter)


export {app}

