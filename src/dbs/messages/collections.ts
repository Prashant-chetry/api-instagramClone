import { Schema, model } from 'mongoose';
import IMessage from './interface';
const message = new Schema(
    {
        value: {
            type: String,
            required: true,
            maxlength: 100,
        },
    },
    { timestamps: true },
);
const messageSchema = new Schema({
    messages: {
        type: [message],
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    imageId: {
        type: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    encrypted: {
        type: Boolean,
        default: false,
    },
});
messageSchema.index({ for: 1, createdBy: 1 });
const Messages = model<IMessage>('messages', messageSchema);
export default Messages;
