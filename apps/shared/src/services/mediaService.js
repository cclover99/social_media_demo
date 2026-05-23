const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');

const multer = require('multer');
const { fileTypeFromFile } = require('file-type');

const db = require('#config/db');


const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('apps/shared/public/profile_images/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex'); // 32 chars
    cb(null, `${name}${ext}`);
  }
});


const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('apps/shared/public/media/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex'); // 32 chars
    cb(null, `${name}${ext}`);
  }
});


exports.profileUpload = multer({ 
    storage: profileStorage,
    limits: {
        // 5MB max limit per pfp
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Check file MIME type
        const allowedMimeTypes = ['image/jpeg', 'image/png'];

        // Apply constraints
        if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false); // Reject
        }
    }
});


exports.postUpload = multer({ 
    storage: postStorage,
    limits: {
        // 50MB max limit regardless of media type
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mkv', '.webm'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Check file MIME type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/x-matroska', 'video/webm'];

        // Apply constraints
        if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false); // Reject
        }
    }
});


exports.deletePostMedia = async (filename) => {
    await fs.unlink(path.join('apps/shared/public/media/', filename));
};


exports.deteleProfilePicture = async (filename) => {
    await fs.unlink(path.join('apps/shared/public/profile_images/', filename));
};
