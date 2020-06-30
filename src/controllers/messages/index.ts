import { Request, Response, NextFunction } from 'express';
import IUsers from '../../dbs/users/interface';
import Joi from '@hapi/joi';
import Messages from '../../dbs/messages/collections';
import HttpError from '../../common/HttpError';
import { isValidObjectId } from 'mongoose';

class MessageController {
    public messageCreate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) return res.status(401).json({ success: false, message: 'user not authenticated - message creation' });
        const { message, from, to } = req.body;
        const { error } = Joi.object({
            messsage: Joi.string().required().max(100),
            from: Joi.string().alphanum().required(),
            to: Joi.string().alphanum().required(),
        }).validate({ message, from, to });

        if (error || !isValidObjectId(from) || !isValidObjectId(to)) {
            return res.status(400).json({ success: false, message: 'bad request body' });
        }
        try {
            const mDoc = await Messages.findOne({ to, createdBy: from }).exec();
            if (!mDoc) {
                await new Messages({ conversations: [{ message }], to, createdBy: from, updatedBy: from }).save();
            } else {
                mDoc.conversations.push({ message });
                await mDoc.save();
            }
            return res.status(200).json({ success: true, message: 'message created' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public messageView = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) return res.status(401).json({ success: false, message: 'user not authenticated - message view' });
        const { from } = req.params;
        const { error } = Joi.string().alphanum().required().validate(from);
        if (error || !isValidObjectId(from)) {
            return res.status(400).json({ success: false, message: 'bad request body' });
        }
        try {
            const doc = await Messages.findOne({ for: user._id, createdBy: from }).lean();
            if (!doc) return res.status(404).json({ success: false, message: 'message not found' });
            return res.status(200).json({ success: false, message: 'message found', data: doc });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public messageList = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) return res.status(401).json({ success: false, message: 'user not authenticated - message list' });
        try {
            const docs = await Messages.find({ to: user._id }).select({ messages: 0 }).lean();
            if (!docs.length) {
                return res.status(404).json({ success: false, message: 'message not found' });
            }
            return res.status(200).json({ success: true, message: 'message found', data: docs });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public messageEdit = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) return res.status(401).json({ success: false, message: 'user not authenticated - message edit' });
        const { to, messageId } = req.query as { to: string; messageId: string };
        const message = req.body.message;
        const { error } = Joi.object({
            message: Joi.string().required().max(100),
            to: Joi.string().alphanum().required(),
            messageId: Joi.ref('to'),
        }).validate({ message, to, messageId });
        if (error || !isValidObjectId(messageId) || !isValidObjectId(to)) {
            return res.status(400).json({ success: false, message: 'bad request body' });
        }
        try {
            const doc = await Messages.findOne({ createdBy: user._id, 'messages._id': messageId, to });
            if (!doc) return res.status(404).json({ success: false, message: 'message not found' });
            // edit to - do
        } catch (error) {
            return next(new HttpError());
        }
    };
}
export default MessageController;
