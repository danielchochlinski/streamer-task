import { Request, Response } from 'express';
import Streamer from '../models/Streamer';

export const createStreamer = async (req: Request, res: Response) => {
    const { name, description, platforms } = req.body;
    const convertedImage = req.compressedImage;
    console.log(convertedImage);

    try {
        const streamerAlreadyExists = await Streamer.findOne({ name });
        if (streamerAlreadyExists) return res.send({ status: 'Success', message: 'Streamer already exisits' });

        const newStreamer = await Streamer.create({ name, description, platforms, image: convertedImage });

        return res.status(201).send({
            status: 'Success',
            message: 'Streamer has been succesfully created',
            streamer: newStreamer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};

export const voteForStreamer = async (req: Request, res: Response) => {
    try {
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};
