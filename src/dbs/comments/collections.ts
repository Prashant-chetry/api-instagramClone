import { Schema, model } from 'mongoose';
import IComments from './interface';

const commentSchema = new Schema(
    {
        comment: {
            type: String,
            minlength: 10,
            maxlength: 100,
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'posts',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
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

const Comments = model<IComments>('comments', commentSchema);
export default Comments;
