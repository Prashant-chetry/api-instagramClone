import bcrypt from 'bcrypt';
import { Request, NextFunction, Response } from 'express';
import AuthenticationValidationSchema from '../validationSchema/validation';
import HttpError from '../../common/HttpError';
import Users from '../../dbs/users/collection';
import isEmpty from '../../common/isEmpty';
import jwt from 'jsonwebtoken';
import Opts from '../../dbs/opts/collections';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import IUsers from '../../dbs/users/interface';
import Joi from '@hapi/joi';

class AuthenticationController {
    public hashPassword = (password: string, round: number, cb: (error: Error, encrypted: string) => void): void => {
        bcrypt.hash(password, round, function (err: Error, encrypted: string) {
            cb(err, encrypted);
        });
    };
    private comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
        return await bcrypt.compare(password, hashedPassword);
    };
    public register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { email, password, secondPassword }: { email: string; password: string; secondPassword: string } = req.body;
        if (password !== secondPassword) {
            return next(new HttpError(false, 'Bad Request', 404));
        }
        try {
            const authValidationSchema = new AuthenticationValidationSchema();
            await Promise.all([
                authValidationSchema.emailValidationAsync(email),
                authValidationSchema.passwordValidationAsync(password),
                authValidationSchema.passwordValidationAsync(secondPassword),
            ]);
        } catch (error) {
            return next(new HttpError(false, 'Bad Request', 404));
        }
        const user = await Users.findOne({ userName: email }, { userName: 1 }).lean();
        console.debug(user, 'user');
        if (!isEmpty(user || {})) return res.json({ success: false, status: 403, message: 'user already exists' });
        try {
            const doc = new Users({
                userName: email,
                password,
                emails: [{ address: email }],
            });
            await doc.save();
        } catch (error) {
            console.debug(error);
            return next(new HttpError());
        }
        return res.json({ success: true, statusCode: 200, message: 'user created successfully' });
    };
    public logIn = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { email, password, secondPassword }: { email: string; password: string; secondPassword: string } = req.body;
        if (password !== secondPassword) {
            return next(new HttpError(false, 'Bad Request', 404));
        }
        try {
            const authValidationSchema = new AuthenticationValidationSchema();
            await Promise.all([
                authValidationSchema.emailValidationAsync(email),
                authValidationSchema.passwordValidationAsync(password),
                authValidationSchema.passwordValidationAsync(secondPassword),
            ]);
        } catch (error) {
            return next(new HttpError(false, 'Bad Request', 409));
        }
        const user = await Users.findOne({ userName: email }).exec();
        if (isEmpty(user || {})) return res.json({ success: false, status: 403, message: "user doesn't exists" });
        console.debug(user);
        const match = await this.comparePassword(password, user?.password || '');
        if (!match) return res.json({ success: false, status: 403, message: "user password doesn't match" });
        try {
            const tokenExists = [...(user?.tokens || [])].pop();
            if (!isEmpty(tokenExists || {})) {
                const { exp: tokenExistsExpiresIn } = jwt.verify(tokenExists?.token || '', 'mySecrete') as {
                    sub: string;
                    iss: string;
                    iat: Date;
                    exp: Date;
                };
                if (new Date(tokenExistsExpiresIn).getTime() >= new Date().getTime()) {
                    return res.status(200).json({
                        success: true,
                        message: 're-login successfully',
                        data: { accessToken: tokenExists?.token, expiresIn: tokenExists?.expiresIn },
                    });
                }
            }
            const iat = new Date().getTime(),
                exp = new Date().setDate(new Date().getDate() + 2);
            const accessToken = jwt.sign(
                {
                    iss: 'instagramClone',
                    sub: user?._id,
                    iat,
                    exp,
                },
                'mySecrete',
            );
            user?.tokens?.push({
                token: accessToken,
                expiresIn: new Date(exp),
                createdAt: new Date(iat),
            });
            await user?.save();
            return res.status(200).json({
                success: true,
                message: 'login successfully',
                data: { accessToken, expiresIn: new Date(exp) },
            });
        } catch (error) {
            console.debug(error);
            return next(new HttpError());
        }
    };
    public logOut = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user) return res.status(401).json({ success: false, message: 'user not authorized' });
        try {
            user.set({ tokens: [] });
            await user.save();
            return res.status(200).json({ success: false, message: 'user logout successful' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { email } = req.body;
        const { error } = Joi.string().email().required().validate(email);
        if (error) {
            return res.json({
                success: false,
                message: 'error',
                error,
            });
        }
        const user = await Users.findOne({ userName: email }).exec();
        if (isEmpty(user || {})) {
            return res.status(404).json({ success: false, message: 'not user found with email' });
        }
        try {
            const opt = crypto.randomBytes(10).toString('hex');
            const doc = new Opts({
                purpose: 'forgetPassword',
                opt,
                for: email,
            });
            const msg = {
                to: email,
                from: 'prashantchetry98@gmail.com',
                subject: 'Welcome to Instagram-Clone Website',
                text: 'and easy to do anywhere, even with Node.js',
                html: `Your current password is <strong>${opt}</strong>`,
            };
            user?.set({ password: opt, tokens: [] });
            await Promise.all([doc.save(), sgMail.send(msg), user?.save()]);
            return res.status(200).json({ success: true, message: 'password send to email' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        const { currentPassword, newPassword, secondNewPassword } = req.body;
        const { error } = Joi.object({
            currentPassword: Joi.string().alphanum().max(100).min(6).required(),
            newPassword: Joi.string().alphanum().max(100).min(6).required(),
            secondNewPassword: Joi.ref('newPassword'),
        }).validate({ currentPassword, newPassword, secondNewPassword });
        if (error) {
            return res.json({
                success: false,
                message: 'error',
                error,
            });
        }
        const match = await this.comparePassword(currentPassword, user.password || '');
        if (!match) return res.json({ success: false, status: 403, message: "user password doesn't match" });
        if (newPassword !== secondNewPassword) {
            return res.status(403).json({ success: false, message: "password didn't match" });
        }
        try {
            user.set({ password: newPassword, tokens: [] });
            await user.save();
            return res.status(200).json({ success: true, message: 'password reset successful' });
        } catch (error) {
            return next(new HttpError());
        }
    };
}
export default AuthenticationController;
