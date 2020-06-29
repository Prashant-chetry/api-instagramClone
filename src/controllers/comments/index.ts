import { Request, Response, NextFunction } from 'express';
import IUsers from '../../dbs/users/interface';
import Joi from '@hapi/joi';
import { isValidObjectId } from 'mongoose';
import Posts from '../../dbs/posts/collections.';
import HttpError from '../../common/HttpError';
import Comments from '../../dbs/comments/collections';

class CommentController {
    public commentCreate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - comment create' });
        }
        const postId = req.params.postId;
        const comment: string = req.body.comment;
        const { error } = Joi.object({
            postId: Joi.string().alphanum().required(),
            comment: Joi.string().required().max(100).min(10),
        }).validate({ postId, comment });
        if (error || !isValidObjectId(postId)) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error: error ? error : 'invalid id',
            });
        }
        try {
            const post = await Posts.findOne({ _id: postId, removed: false }, { comments: 1 }).exec();
            if (!post) {
                return res.status(404).json({ success: false, message: 'post not found' });
            }
            const commentDoc = new Comments({ comment, postId: post._id, createdBy: user._id, updatedBy: user._id });
            post.comments.push({ _id: commentDoc._id });
            await Promise.all([commentDoc.save(), post.save()]);
            return res.status(200).json({ success: true, message: 'comment creation successful' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public commentEdit = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - comment edit' });
        }
        const postId = req.params.id;
        const { commentId } = req.query;
        const comment: string = req.body.comment;
        const { error } = Joi.object({
            postId: Joi.string().alphanum().required(),
            commentId: Joi.ref('postId'),
            comment: Joi.string().required().max(100).min(10),
        }).validate({ postId, commentId, comment });
        if (error || !isValidObjectId(postId) || !isValidObjectId(commentId)) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error: error ? error : 'invalid id',
            });
        }
        try {
            const cDoc = await Comments.findOne({ _id: commentId, createdBy: user._id, removed: false, postId }).exec();
            if (!cDoc) {
                return res.status(404).json({ success: false, message: 'comment not found' });
            }
            cDoc.set({ comment, updatedBy: user._id });
            await cDoc.save();
            return res.status(200).json({ success: true, message: 'comment edit successful' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public commentDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - comment deletion' });
        }
        const postId = req.params.id;
        const { commentId } = req.query;
        const { error } = Joi.object({
            postId: Joi.string().alphanum().required(),
            commentId: Joi.ref('postId'),
        }).validate({ postId, commentId });

        if (error || !isValidObjectId(commentId) || !isValidObjectId(postId)) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error: error ? error : 'invalid id',
            });
        }
        try {
            const [postDoc, cDoc] = await Promise.all([
                Posts.findOne({ _id: postId, 'comments._id': commentId, removed: false }, { comments: 1 }).exec(),
                Comments.findOne({ _id: commentId, postId, 'comments.createdBy': user._id, removed: false }).exec(),
            ]);
            if (!postDoc || !cDoc) {
                return res.status(404).json({ success: false, message: 'comment or post not found' });
            }
            postDoc.set({ comments: postDoc.comments.filter((i) => i._id !== commentId) });
            cDoc.set({ removed: true });
            await Promise.all([postDoc.save(), cDoc.save()]);
            return res.status(200).json({ success: true, message: 'post delete successful' });
        } catch (error) {
            return next(new HttpError());
        }
    };
}
export default CommentController;
