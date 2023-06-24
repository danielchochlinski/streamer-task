import mongoose, { Document, Schema } from 'mongoose';

export interface IStreamer {
    name: string;
    platform: string[];
    description: string;
    votes: {
        up: number;
        down: number;
    };
    image: Buffer;
}

export interface IStreamerModel extends IStreamer, Document {}

const StreamerSchema: Schema = new Schema({
    name: { type: String, required: [true, 'Streamer must have a name!'] },
    platforms: [{ type: String }],
    description: { type: String, required: [true, 'Streamer must have a description!'] },
    votes: {
        up: { type: Number },
        down: { type: Number }
    },
    image: { type: Buffer }
});

export default mongoose.model<IStreamerModel>('Streamer', StreamerSchema);
