import { postSchema } from './collections.';

postSchema.pre('find', function () {
    this.setQuery({ ...this.getQuery(), removed: false });
    console.debug(this.getQuery(), 'getQuery');
});
