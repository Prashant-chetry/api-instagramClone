import { Document } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IOpts extends Document {
    type: string;
    opt: string;
    for: string;
    createdAt?: string;
    updatedAt?: string;
}
export default IOpts;
