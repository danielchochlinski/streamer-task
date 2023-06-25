import { Request, Response } from 'express';

//for testing purpose
export const testAppController = async (_req: Request, res: Response) => {
    try {
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
