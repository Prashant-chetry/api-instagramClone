import { Document, Types } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IComments extends Document {
    comment: string;
    postId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    removed?: boolean;
    softRemove(): Promise<IComments>;
    softRestore(): Promise<IComments>;
}
export default IComments;
