import { Document, Types } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IComments extends Document {
    comment: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    removed?: boolean;
}
export default IComments;
