import { Request, Response, NextFunction } from 'express';
import IUsers from '../../dbs/users/interface';
import Posts from '../../dbs/posts/collections.';
import HttpError from '../../common/HttpError';
import Joi from '@hapi/joi';
import isEmpty from '../../common/isEmpty';
import isAdmin from '../../common/isAdmin';
import { Types, isValidObjectId } from 'mongoose';
import Comments from '../../dbs/comments/collections';
import Users from '../../dbs/users/collection';
import IComments from '../../dbs/comments/interface';
import IPostController from './interface';
import axios from 'axios';
import apiUrl from '../../common/apiUrl';

class PostController implements IPostController {
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
        if (!isValidObjectId(id)) return res.status(401).json({ success: false, message: 'not valid id' });
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
                await pDoc.softRemove();
                return res.status(200).json({ success: true, message: 'post delete successful' });
            } else return res.status(402).json({ success: false, message: 'user not authorized - delete post' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public postView = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { id } = req.params;
        const { error } = Joi.string().alphanum().required().validate(id);
        if (error || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            const doc = await Posts.findOne({ _id: id, removed: false }, { removed: 0 })
                .populate({ path: 'user', select: { userName: 1 }, match: { removed: false, userName: { $nin: [[], ''] } } })
                .lean();
            if (!doc) return res.status(404).json({ success: false, message: 'post not found' });
            const commentObj: { [key: string]: IComments } = {};

            const { data, status }: { data: { success: boolean; message: string; data?: [IComments] }; status: number } = await axios.get(
                apiUrl(`/v1/api/comment/view/list/${doc._id}`),
                {
                    headers: {
                        'content-type': 'application/json',
                        authentication: req.authInfo,
                    },
                },
            );
            if (status === 200) {
                data.data?.forEach((i) => (commentObj[i._id] = i));
                const comments: Array<IComments> = [];
                doc.comments.forEach((comment) => {
                    const id = (comment._id as unknown) as string;
                    const c = commentObj[id];
                    if (!c) return;
                    comments.push(c);
                });
                doc.comments = comments;
            }
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
            const posts = await Posts.find()
                .select({ removed: 0 })
                .populate({ path: 'user', select: { userName: 1 } })
                .lean();
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
