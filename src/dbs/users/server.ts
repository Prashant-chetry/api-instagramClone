import { userSchema } from './collection';
import IUsers from './interface';
import Joi from '@hapi/joi';
import bcrypt from 'bcrypt';
import sendMail from '../../common/sendMail';
import { HookNextFunction } from 'mongoose';

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
userSchema.pre('save', async function (next: HookNextFunction) {
    const user: IUsers = this as IUsers;
    if (user.password && user.isModified('password')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        return next();
    }
    return next();
});
userSchema.post('save', async function (user: IUsers, next: HookNextFunction) {
    try {
        if (!user.welcomeMailSend && user.userName) {
            const isMailSend: boolean = await sendMail({
                to: user.userName,
                subject: 'Welcome to Instagram-Clone Website',
                html: `<strong>Welcome ${user.userName} to instagramClone. we are happy that you joined us</strong>`,
            });
            if (!isMailSend) {
                return next(new Error('failed to send mail'));
            }
            user.welcomeMailSend = true;
            return next();
        }
    } catch (error) {
        return next(error);
    }
});
