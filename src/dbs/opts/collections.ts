import { Schema, model } from 'mongoose';
import IOpts from './interface';

const optSchema = new Schema(
    {
        purpose: {
            type: String,
            enum: ['phoneVerification', 'emailVerification', 'forgetPassword', 'twoStepAuthentication'],
            required: true,
        },
        opt: {
            type: String,
            maxlength: 20,
            minlength: 5,
            required: true,
        },
        for: {
            type: String,
            ref: 'users',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
const Opts = model<IOpts>('opts', optSchema);
export default Opts;
