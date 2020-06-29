import { Document, Types } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IOpts extends Document {
    type: string;
    opt: string;
    for: string;
    userId: Types.ObjectId;
    createdAt?: string;
    updatedAt?: string;
}
export default IOpts;
