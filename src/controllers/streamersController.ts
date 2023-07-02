import { Request, Response } from 'express';
import Streamer, { IStreamer } from '../models/Streamer';

export const findStreamerByName = async (req: Request, res: Response) => {
    const { name } = req.query;
    try {
        const streamer = await Streamer.findOne({ name }).lean();
        if (!streamer)
            return res.status(204).send({
                status: 'WARNING',
                message: 'Streamer not found!'
            });
        return res.send({
            status: 'SUCCESS',
            message: 'Streamer has been successfully found!',
            streamer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: 'ERROR', message: 'Internal Server Error' });
    }
};
export const getAllStreamerNames = async (req: Request, res: Response) => {
    try {
        const streamers = await Streamer.find({}, { name: 1 }).lean();
        const streamerNames = streamers.map((streamer: IStreamer) => {
            return { name: streamer.name };
        });

        return res.send({
            status: 'SUCCESS',
            streamers: streamerNames
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: 'ERROR', message: 'Internal Server Error' });
    }
};

export const getAllStreamers = async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    try {
        let streamersQuery = Streamer.find();

        if (pageNumber && pageSize) {
            streamersQuery = streamersQuery.skip((pageNumber - 1) * pageSize).limit(pageSize);
        }

        const [streamers, totalDocuments] = await Promise.all([streamersQuery.lean(), Streamer.countDocuments()]);

        const totalPages = Math.ceil(totalDocuments / pageSize);
        return res.send({
            status: 'SUCCESS',
            streamers,
            totalPages,
            currentPage: pageNumber,
            totalDocuments
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: 'ERROR', message: 'Internal Server Error' });
    }
};

export const createStreamer = async (req: Request, res: Response) => {
    const { name, description, platforms } = req.body;
    const convertedImage = req.compressedImage;

    try {
        const streamerAlreadyExists = await Streamer.findOne({ name });
        if (streamerAlreadyExists) {
            return res.status(400).send({
                status: 'WARNING',
                message: 'Streamer already exists'
            });
        }

        const parsedPlatforms = JSON.parse(platforms);

        const newStreamer = await Streamer.create({
            name,
            description,
            platforms: parsedPlatforms,
            image: convertedImage
        });

        return res.status(201).send({
            status: 'SUCCESS',
            message: 'Streamer has been successfully created',
            streamer: newStreamer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: 'ERROR', message: 'Internal Server Error' });
    }
};

export const voteForStreamer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { voteType } = req.body;

    try {
        if (!voteType) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Invalid request. Please provide voteType.'
            });
        }

        const updatedStreamer = await Streamer.findOneAndUpdate({ _id: id }, { $inc: { [`votes.${voteType}`]: 1 } }, { new: true });

        if (!updatedStreamer) {
            return res.status(204).json({
                status: 'WARNING',
                message: 'Streamer not found.'
            });
        }

        return res.status(201).send({
            status: 'SUCCESS',
            message: 'Your vote has been successfully added!',
            votes: {
                up: updatedStreamer.votes.up,
                down: updatedStreamer.votes.down
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: 'ERROR', message: 'Internal Server Error' });
    }
};

export const getPopularStreamers = async (_req: Request, res: Response) => {
    try {
        const popularStreamers = await Streamer.find().sort({ 'votes.up': -1 }).limit(5).lean();

        if (popularStreamers.length === 0) {
            return res.status(204).send({
                status: 'WARNING',
                message: 'No streamer found!'
            });
        }

        return res.send({
            status: 'SUCCESS',
            popularStreamers
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: 'ERROR', message: 'Internal Server Error' });
    }
};
