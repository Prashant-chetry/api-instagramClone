import { userSchema } from './collection';
import IUsers from './interface';
import Joi from '@hapi/joi';

userSchema.method({
    saveInternal: function () {
        const doc = this as IUsers;
        const { phones, emails, userName } = doc;
        if (doc.isNew) {
            const { error } = Joi.string().alphanum().email().validate(userName);
            console.debug(error);
            if (!error) doc.emails.push({ address: userName, verified: false });
            const email = emails?.pop();
            const phone = phones?.pop();
            if (email) doc.set('userName', email);
            if (phone && !email) doc.set('userName', phone);
            doc.set('use', ['internal']);
            //TO-DO send mail for password
            return doc.save();
        }
    },
    softRemove() {
        const doc = this as IUsers;
        doc.set({ removed: true });
        return doc.save();
    },
    softRestore() {
        const doc = this as IUsers;
        doc.set({ removed: false });
        return doc.save();
    },
});

userSchema.pre('find', function () {
    this.setQuery({ ...this.getQuery(), removed: false });
});
