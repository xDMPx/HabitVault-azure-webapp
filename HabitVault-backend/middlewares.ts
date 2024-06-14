import { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { redis } from './app'

const prisma = new PrismaClient()

declare module 'express-session' {
    interface SessionData {
        username: string | undefined
    }
}

export function log(req: Request, _res: Response, next: NextFunction) {
    console.log(`${req.ip} ${req.method} ${req.url} => ${JSON.stringify(req.body)}`)
    next()
}

export async function restrict(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.session.username !== undefined) {
            const banned = (await redis.get(`banned:${req.session.username}`) === "1")
            if (banned) {
                res.status(401).json()
            } else {
                res.locals.username = req.session.username
                next()
            }
        } else {
            res.status(401).json()
        }

    } catch (err) {
        next(err)
    }
}

export async function adminRestrict(req: Request, res: Response, next: NextFunction) {
    if (req.session.username !== undefined) {
        const admin = await prisma.user.findFirst({
            where: {
                username: req.session.username,
            },
            select: {
                admin: true
            }
        }).catch((err) => next(err))

        if (admin?.admin) {
            res.locals.username = req.session.username
            next()
        } else {
            res.status(401).json()
        }

    } else {
        res.status(401).json()
    }
}
