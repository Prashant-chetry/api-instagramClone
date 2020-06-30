import { postSchema } from './collections.';
import IPost from './interface';

postSchema.pre('find', function () {
    this.setQuery({ ...this.getQuery(), removed: false });
    console.debug(this.getQuery(), 'getQuery');
});

postSchema.virtual('user', {
    ref: 'users',
    localField: 'createdBy',
    foreignField: '_id',
});

postSchema.method({
    softRemove() {
        const doc = this as IPost;
        doc.set({ removed: true });
        return doc.save();
    },
    softRestore() {
        const doc = this as IPost;
        doc.set({ removed: false });
        return doc.save();
    },
});
