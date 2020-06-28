import { Request, Response, NextFunction } from 'express';
import IUsers from '../../dbs/users/interface';
import Joi from '@hapi/joi';
import crypto from 'crypto';
import Opts from '../../dbs/opts/collections';
import sgMail from '@sendgrid/mail';
import HttpError from '../../common/HttpError';

class UserVerificationController {
    public phoneVerification = async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as IUsers;
        const phone: string = req.body?.phone;
        const { error } = Joi.string().required().valid(/[0-9]/).length(10).validate(phone);
        if (error) {
            return res.json({
                success: false,
                message: 'error',
                error,
            });
        }
        const opt = crypto.randomBytes(10).toString('hex');
        const msg = {
            to: phone,
            from: 'prashantchetry98@gmail.com',
            subject: 'Welcome to Instagram-Clone Website',
            text: 'and easy to do anywhere, even with Node.js',
            html: `Your current password is <strong>${opt}</strong>`,
        };

        try {
            const doc = new Opts({
                purpose: 'forgetPassword',
                opt,
                for: phone,
            });
        } catch (error) {}
    };
    public sendEmailVerificationCode = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { email, purpose } = req.body;
        const { error } = Joi.object({
            email: Joi.string().email().required(),
            purpose: Joi.string().valid('emailVerification', 'twoStepAuthentication'),
        }).validate({ email, purpose });
        if (error) {
            return res.json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            const opt = crypto.randomBytes(10).toString('hex');
            const doc = new Opts({
                purpose,
                opt,
                for: email,
            });
            const msg = {
                to: email,
                from: 'prashantchetry98@gmail.com',
                subject: 'Your Verification for Instagram-Clone',
                // text: 'and easy to do anywhere, even with Node.js',
                html: `Your Verification code is <strong>${opt}</strong>.`,
            };
            await Promise.all([doc.save(), sgMail.send(msg)]);
            return res.status(200).json({ success: true, message: 'email verification code send' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public emailVerification = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        const code: string = req.body.emailVerificationCode;
        const { error } = Joi.string().required().validate(code);
        if (error) {
            return res.json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            const doc = await Opts.findOne({ purpose: 'emailVerification', for: user.userName, opt: code }).lean();
            if (!doc) {
                return res.status(402).json({ success: false, message: 'invalid email code' });
            }
            user.emails.forEach((i) => {
                if (i.address !== doc.for) return;
                i.verified = true;
            });
            if (user.isModified('emails.verified')) {
                console.debug('running');
            }
            await user.save();
            return res.status(200).json({ success: false, message: 'email verification successful' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public twoStepAuthentication = async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as IUsers;
    };
}
export default UserVerificationController;
