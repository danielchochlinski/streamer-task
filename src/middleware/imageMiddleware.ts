import multer from 'multer';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { NextFunction, Request, Response } from 'express';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5000000 },
    fileFilter: (_req, file, cb) => {
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    }
});

export const imageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const fileBuffer = req.file?.buffer as Buffer;
            let compressedImage: Buffer;

            // Convert HEIF/HEIC to JPEG
            if (req?.file?.mimetype === 'image/heif' || req?.file?.mimetype === 'image/heic') {
                try {
                    const { buffer }: any = await heicConvert({
                        buffer: fileBuffer,
                        format: 'JPEG'
                    });
                    compressedImage = await sharp(buffer)
                        .resize(600, 800, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .jpeg({ quality: 80 })
                        .toBuffer();
                } catch (conversionError) {
                    console.error('Error converting HEIC file to JPEG:', conversionError);
                    return res.status(500).json({ error: 'Error converting HEIC file to JPEG' });
                }
            } else {
                // Convert other image formats to JPEG
                try {
                    compressedImage = await sharp(fileBuffer)
                        .resize(600, 800, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .jpeg({ quality: 80 })
                        .toBuffer();
                } catch (conversionError) {
                    console.error('Error converting image file to JPEG:', conversionError);
                    return res.status(500).json({ error: 'Error converting image file to JPEG' });
                }
            }

            req.compressedImage = compressedImage;

            next();
        });
    } catch (err) {
        console.error(err);
    }
};
