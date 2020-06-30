import { Schema, model } from 'mongoose';
import IMessage from './interface';
const conversationSchema = new Schema(
    {
        message: {
            type: String,
            required: true,
            maxlength: 100,
        },
    },
    { timestamps: true },
);
const messageSchema = new Schema({
    conversations: {
        type: [conversationSchema],
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
messageSchema.index({ to: 1, createdBy: 1 });
const Messages = model<IMessage>('messages', messageSchema);
export default Messages;
