import { S3Client } from "@aws-sdk/client-s3"
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import crypto from 'crypto';

// Initialize the new AWS SDK v3 S3 Client
const s3 = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

// Create Multer configured natively to blast data perfectly into the Bucket
export const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET!,
        // ✅ Auto-detect content type so S3 serves images with correct MIME (image/png, image/jpeg, etc.)
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // ✅ Tells S3 to display the file inline in the browser (not force-download)
        contentDisposition: 'inline',
        // Generate a clean filename for AWS preserving extensions (e.g. .png / .jpg)
        key: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            const randomIdent = crypto.randomBytes(12).toString('hex');
            cb(null, `uploads/${randomIdent}${ext}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Validating image extension types safely!
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image type!'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Hard stop at 10MB to avoid enormous payloads
    }
});