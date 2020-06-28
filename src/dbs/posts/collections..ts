import { Schema, model } from 'mongoose';
import IPost from './interface';
const commentSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: 'comments',
        index: true,
    },
});
const postSchema = new Schema(
    {
        title: {
            type: String,
            maxlength: 200,
            minlength: 10,
            trim: true,
            required: true,
            index: 'text',
        },
        subject: {
            type: String,
            maxlength: 500,
            minlength: 10,
            trim: true,
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        comments: {
            type: [commentSchema],
            default: [],
        },
        removed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);
require('./server');
const Posts = model<IPost>('posts', postSchema);
export default Posts;
export { postSchema };
