import { Request, Response, NextFunction } from 'express';
import Joi from '@hapi/joi';
const reqLogs = new Map();
const limit = 50;
const rateLimiter = function (req: Request, res: Response, next: NextFunction): void | Response<unknown> {
    const ip = req.ip;

    const apiKey = req.headers.apiKey;
    // in case of server, no limit
    if (apiKey && apiKey === process.env.API_KEY) {
        return next();
    }
    const { error } = Joi.string().ip().validate(ip);
    if (error) {
        return res.status(404).json({ success: false, message: 'bad request', error });
    }
    const currentDate = new Date();
    if (!ip) return res.status(401).json({ success: false, message: 'server throttling' });
    if (!reqLogs.has(ip)) {
        reqLogs.set(ip, {
            startingTime: currentDate.getTime(),
            endingTime: new Date(currentDate.setMinutes(currentDate.getMinutes() + 10)).getTime(),
            numberOfRequest: 1,
        });
        return next();
    } else {
        const { startingTime, endingTime, numberOfRequest } = reqLogs.get(ip);
        const count = numberOfRequest + 1;
        if (currentDate.getTime() <= new Date(endingTime).getTime() && count <= limit) {
            reqLogs.set(ip, { startingTime, endingTime, numberOfRequest: count });
            return next();
        }
        if (currentDate.getTime() <= new Date(endingTime).getTime() && count > limit) {
            res.status(200).json({ success: false, message: 'server throttling' });
        }
        if (currentDate.getTime() > new Date(endingTime).getTime() && count <= limit) {
            reqLogs.set(ip, { startingTime, endingTime, numberOfRequest: count });
            return next();
        }
        if (currentDate.getTime() > new Date(endingTime).getTime() && count > limit) {
            reqLogs.delete(ip);
            return next();
        }
    }
};
export default rateLimiter;
