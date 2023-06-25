import { Request, Response } from 'express';
import Streamer from '../models/Streamer';

export const findStreamerByName = async (req: Request, res: Response) => {
    const { name } = req.query;
    try {
        const streamer = await Streamer.find({ name });
        if (!streamer || streamer.length === 0)
            return res.status(404).send({
                status: 'Error',
                message: 'Streamer not found!'
            });
        return res.send({
            status: 'Success',
            message: 'Streamer has been successfully found!',
            streamer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};

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

        //additional information note to myself
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

    try {
        const streamerAlreadyExists = await Streamer.findOne({ name });
        if (streamerAlreadyExists)
            return res.send({
                status: 'Error',
                message: 'Streamer already exists'
            });

        const newStreamer = await Streamer.create({
            name,
            description,
            platforms,
            image: convertedImage
        });

        return res.status(201).send({
            status: 'Success',
            message: 'Streamer has been successfully created',
            streamer: newStreamer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};

export const voteForStreamer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { voteType } = req.body;

    try {
        if (!voteType) {
            return res.status(400).json({
                status: 'Error',
                message: 'Invalid request. Please provide voteType.'
            });
        }

        const updatedStreamer = await Streamer.findOneAndUpdate({ _id: id }, { $inc: { [`votes.${voteType}`]: 1 } }, { new: true });

        if (!updatedStreamer) {
            return res.status(404).json({
                status: 'Error',
                message: 'Streamer not found.'
            });
        }

        return res.json({
            status: 'Success',
            message: 'Your vote has been successfully added!',
            votes: {
                up: updatedStreamer.votes.up,
                down: updatedStreamer.votes.down
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};
