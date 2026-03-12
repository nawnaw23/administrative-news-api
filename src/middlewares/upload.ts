import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import crypto from "crypto";

const s3 = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const uploadS3 = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_S3_BUCKET!,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: "inline",
        key: function (req, file, cb) {
            const ext = path.extname(file.originalname);
            const randomIdent = crypto.randomBytes(12).toString("hex");
            cb(null, `uploads/${randomIdent}${ext}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
            return;
        }

        cb(new Error("Invalid image type!"));
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
