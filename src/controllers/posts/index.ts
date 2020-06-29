import { Request, Response, NextFunction } from 'express';
import IUsers from '../../dbs/users/interface';
import Posts from '../../dbs/posts/collections.';
import HttpError from '../../common/HttpError';
import Joi from '@hapi/joi';
import isEmpty from '../../common/isEmpty';
import isAdmin from '../../common/isAdmin';
import mongoose, { Types, isValidObjectId } from 'mongoose';
import Comments from '../../dbs/comments/collections';
import Users from '../../dbs/users/collection';
import IComments from '../../dbs/comments/interface';

class PostController {
    public postCreate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        const { title, subject } = req.body;
        if (!user._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile edit' });
        }
        const { error } = Joi.object({
            title: Joi.string().max(200).min(10),
            subject: Joi.string().max(500).min(10),
        }).validate({ title, subject });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            await new Posts({ title, subject, createdBy: user._id, updatedBy: user._id }).save();
            return res.status(200).json({ success: true, message: 'post creation successful' });
        } catch (error) {
            console.error(error);
            return next(new HttpError());
        }
    };
    public postEdit = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        const { title, subject } = req.body;
        const { id } = req.params;
        if (!user._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile edit' });
        }
        if (!id) return res.status(404).json({ success: false, message: 'No post found' });
        const { error } = Joi.object({
            title: Joi.string().max(200).min(10),
            subject: Joi.string().max(500).min(10),
            id: Joi.string().alphanum().max(200).required(),
        }).validate({ title, subject, id });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'error',
                error,
            });
        }
        const validId = mongoose.isValidObjectId(id);
        console.log(validId);
        if (!validId) return res.status(401).json({ success: false, message: 'not valid id' });
        try {
            const post = await Posts.findById(id).exec();
            if (isEmpty(post || {})) {
                return res.status(404).json({ success: false, message: 'No post found' });
            }
            const data = { title, subject };
            if (!title) delete data.title;
            if (!subject) delete data.subject;
            if (!Object.keys(data).length) return res.status(404).json({ success: false, message: 'not data' });
            post?.set({ ...data, updatedBy: user._id });
            await post?.save();
            return res.status(200).json({ success: true, message: 'post edit successful' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public postDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - post deletion' });
        }
        const { id } = req.params;
        const { error } = Joi.string().alphanum().validate(id);
        if (error || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'error',
                error,
            });
        }
        const admin = isAdmin(user._id);
        const query = { _id: id, createdBy: user._id, removed: false };
        if (admin) delete query.createdBy;
        try {
            const pDoc = await Posts.findOne(query).exec();
            if (!pDoc) return res.status(404).json({ success: false, message: 'post not found' });
            if (admin || pDoc?.createdBy === user._id) {
                try {
                    pDoc.set({ removed: true });
                    await pDoc.save();
                    return res.status(200).json({ success: true, message: 'post delete successful' });
                } catch (error) {
                    throw new Error('failed to remove post');
                }
            } else return res.status(402).json({ success: false, message: 'user not authorized - delete post' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public postView = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { id } = req.params;
        const { error } = Joi.string().alphanum().validate(id);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            const doc = await Posts.findOne({ _id: id, removed: false }).lean();
            if (!doc) return res.status(404).json({ success: false, message: 'post not found' });
            // const commentsCursor = Comments.collection.find<IComments>({
            //     postId: doc._id,
            //     removed: false,
            //     _id: { $in: doc.comments.map((i) => i._id) },
            // });
            // const comments = new Map<Types.ObjectId, IComments>(),
            //     users = new Map<Types.ObjectId, IUsers>(),
            //     commentArr = [];
            // commentsCursor.forEach((i) => {
            //     if (comments.has(i._id)) return;
            //     comments.set(i._id, i);
            // });
            // if (comments.size) {
            //     const userCursor = Users.collection.find<IUsers>(
            //         { _id: { $in: commentsCursor.map((i) => i.createdBy) } },
            //         { fields: { userName: 1 } },
            //     );
            //     userCursor.forEach((i) => {
            //         if (users.has(i._id)) return;
            //         users.set(i._id, i);
            //     });

            //     doc.comments.forEach((i) => {
            //         if (!comments.has(i._id || Types.ObjectId())) return;
            //         // commentArr.push({ ...comments.get(i._id || Types.ObjectId()), ...users.get(i._id) });
            //     });
            const agr = Comments.aggregate([
                { $match: { _id: { $in: doc.comments.map((i) => i._id) || [], postId: doc._id, removed: false } } },
                {
                    $lookup: {
                        from: 'users',
                        let: { createdBy: '$userIds' },
                        pipeline: [{ $match: { $expr: { $in: ['$_id', '$$userIds'] } } }, { $project: { userName: 1 } }],
                    },
                    as: 'users',
                },
                { $unwind: '$users' },
                { $group: { _id: { commentId: '$_id' } } },
            ]).exec();
            console.debug(agr, 'agr');
            // }
            return res.status(200).json({ success: true, message: 'post view successful', data: doc });
        } catch (error) {
            console.error(error);
            return next(new HttpError());
        }
    };
    public postListView = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!isAdmin(user._id)) return res.status(401).json({ success: false, message: 'user not authorized - postListView' });
        try {
            const posts = await Posts.find().select({ removed: 0 }).lean();
            if (isEmpty(posts || {})) {
                return res.status(404).json({ success: false, message: 'post not found' });
            }
            return res.status(200).json({ success: false, message: 'post found successful', data: posts });
        } catch (error) {
            console.log(error);
            return next(new HttpError());
        }
    };
}

export default PostController;
