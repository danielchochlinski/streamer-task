import { Request, Response } from 'express';
import Streamer from '../models/Streamer';
import queryString from 'qs';

export const getAllStreamers = async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    try {
        const [streamers, totalDocuments] = await Promise.all([
            Streamer.find()
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .lean(),
            Streamer.countDocuments()
        ]);

        const totalPages = Math.ceil(totalDocuments / pageSize);

        //additional information note for myself
        // const queryParams = queryString.stringify({ page: String(page), limit: String(limit) });

        return res.send({
            status: 'Success',
            streamers,
            totalPages,
            currentPage: pageNumber,
            totalDocuments
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};

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
    const { up, down } = req.body;
    const update = { up, down };
    const { id } = req.params;
    try {
        const updatedStreamer = await Streamer.findByIdAndUpdate(id, { $push: { votes: update } }, { new: true });
        return res.send({
            status: 'Success',
            message: 'Your vote has been succesfully added!',
            votes: updatedStreamer?.votes
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};
