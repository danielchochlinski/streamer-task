import mongoose, { Document, Schema } from 'mongoose';

export interface IStreamer {
    name: string;
    platforms: string[];
    description: string;
    votes: {
        up: number;
        down: number;
    };
    image: Buffer;
}

interface IStreamerModel extends IStreamer, Document {}

const StreamerSchema: Schema = new Schema(
    {
        name: { type: String, required: [true, 'Streamer must have a name!'], unique: true },
        platforms: [{ type: String }],
        description: { type: String, required: [true, 'Streamer must have a description!'] },
        votes: {
            up: { type: Number, default: 0 },
            down: { type: Number, default: 0 }
        },
        image: { type: Buffer }
    },
    { timestamps: true }
);

export default mongoose.model<IStreamerModel>('Streamer', StreamerSchema);
