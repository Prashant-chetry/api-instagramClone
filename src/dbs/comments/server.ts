import { commentSchema } from './collections';
import IComments from './interface';

commentSchema.virtual('user', {
    ref: 'users',
    localField: 'createdBy',
    foreignField: '_id',
});
commentSchema.method({
    softRemove() {
        const doc = this as IComments;
        doc.set({ removed: true });
        return doc.save();
    },
    softRestore() {
        const doc = this as IComments;
        doc.set({ removed: false });
        return doc.save();
    },
});
