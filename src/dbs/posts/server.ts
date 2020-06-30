import { postSchema } from './collections.';

postSchema.pre('find', function () {
    this.setQuery({ ...this.getQuery(), removed: false });
    console.debug(this.getQuery(), 'getQuery');
});

postSchema.virtual('user', {
    ref: 'users',
    localField: 'createdBy',
    foreignField: '_id',
});

// postSchema.virtual('comment', {
//     ref: 'comments',
//     localField: 'comments._id',
//     foreignField: '_id',
// });
