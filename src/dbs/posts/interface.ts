/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Document, Types } from 'mongoose';

interface IComment {
    _id?: Types.ObjectId;
}
interface IPost extends Document {
    title: string;
    subject: string;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    comments: Array<IComment>;
    removed?: boolean;
}
export default IPost;
