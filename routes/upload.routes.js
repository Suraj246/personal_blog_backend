import express from 'express'

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import { CloudinaryStorage } from 'multer-storage-cloudinary';


const router = express()

cloudinary.config({
    cloud_name: 'dack5ibxd',
    api_key: '991389183822816',
    api_secret: 'k9XfVTSemYZhAtv_MEb8KHZfuqs',
})

// Use memory storage to upload directly to Cloudinary
// const storage = multer.memoryStorage();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: `blog-images`,
        format: async (req, file) => 'png', // supports promises as well
        public_id: (req, file) => file.fieldname + "" + Date.now(),
        transformation: [
            {
                width: 700,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto',
            },]
    },
})
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


router.post('/upload-image', upload.single('blog-images'), async (req, res) => {
    // console.log("req", req.file)
    // console.log("path", req.file.path)
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ url: req.file.path });
    } catch (err) {
        console.error('Upload error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Upload failed', details: err });
        }
    }
});


export default router
