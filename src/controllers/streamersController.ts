import { Request, Response } from 'express';
import Streamer from '../models/Streamer';

export const createStreamer = async (req: Request, res: Response) => {
    const { name, description, platform } = req.body;
    const convertedImage = req.compressedImage;
    console.log(convertedImage);

    try {
        const newStreamer = await Streamer.create({ name, description, platform, image: convertedImage });

        return res.send({
            status: 'Success',
            streamer: newStreamer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};
