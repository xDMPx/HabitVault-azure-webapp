import express, { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import RedisStore from "connect-redis"
import Redis from "ioredis"
import cors from 'cors'
import dotenv from "dotenv"
import { spawn } from "node:child_process"
import history = require("connect-history-api-fallback")

import { log } from './middlewares'

dotenv.config()
export const sessionSecret = process.env.SESSION_SECRET ?? ""
if (sessionSecret === "") {
    throw "Define SESSION_SECRET in .env"
}
export const crosOrigin = process.env.CROS_ORIGIN ?? ""
if (crosOrigin === "") {
    throw "Define CROS_ORIGIN in .env"
}
export const redisURL = process.env.REDIS_URL ?? ""
if (redisURL === "") {
    throw "Define REDIS_URL in .env"
}
npm install 
const command = spawn('npm', ["install", "@prisma/client"])
command.stdout.on('data', output => {
    console.log("Output: ", output.toString())
})

const command = spawn('npx', ["prisma", "migrate", "deploy"])
command.stdout.on('data', output => {
    console.log("Output: ", output.toString())
})

console.log(process.env.REDIS_URL)
console.log(process.env.DATABASE_URL)
export const redis = new Redis(process.env.REDIS_URL || "", { tls: true as any })
export const redisStore = new RedisStore({
    client: redis,
})
const app = express()
app.use(express.json())
app.use(session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: sessionSecret,
    name: "session",
    cookie: {
        maxAge: 31536000000,
        secure: false,
        sameSite: 'lax'
    }
}))
app.use(cors({
    origin: crosOrigin,
    credentials: true,
}))
// @ts-ignore
app.use(history())
app.use(log)

app.use(express.static('dist'))
app.use('/api/', require('./routes/api'))
app.use('/api/admin', require('./routes/api/admin'))
app.use('/api/user', require('./routes/api/user'))
app.use('/api/user/habits', require('./routes/api/user/habits'))

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`${req.ip} ${req.method} ${req.url} => ERROR\n${err}`)
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).json({ error: "INTERNAL SERVER ERROR" })
});

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`HabitVault backend listening on port ${port}`)
})

