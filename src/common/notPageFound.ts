import { Request, Response } from 'express';

export default (req: Request, res: Response): Response => {
    return res.status(404).json({ success: false, message: 'page not found' });
};
