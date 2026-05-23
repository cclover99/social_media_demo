const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const crypto = require('crypto');

const multer = require('multer');
const { fileTypeFromFile } = require('file-type');

const db = require('#config/db');



// Set allowed extensions
const profileMediaExtensions = ['.jpg', '.jpeg', '.png'];
const profileMimeTypes = ['image/jpeg', 'image/png'];

const postMediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mkv', '.webm'];
const postMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];



// Set disk storage
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



// Set disk storage
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



// Multer setup
exports.profileUpload = multer({ 
    storage: profileStorage,
    limits: {
        // 5MB max limit per pfp
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = profileMediaExtensions;
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Check file MIME type
        const allowedMimeTypes = profileMimeTypes;

        // Apply constraints
        if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false); // Reject
        }
    }
});



// Multer setup
exports.postUpload = multer({ 
    storage: postStorage,
    limits: {
        // 50MB max limit regardless of media type
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = postMediaExtensions;
        const ext = path.extname(file.originalname).toLowerCase();
        
        // Check file MIME type
        const allowedMimeTypes = postMimeTypes;

        // Apply constraints
        if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.log('reject')
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false); // Reject
        }
    }
});



// Verify file type in cases of mime spoof
exports.verifyFileType = (uploadType) => {
    return async (req, res, next) => {
        let allowedTypes;
        if (uploadType == "post"){
            allowedTypes = postMimeTypes;
        } else if (uploadType == "profile"){
            allowedTypes = profileMimeTypes;
        } else{
            return res.status(500).send('Internal server error in function variable');
        }

        // Normalize input
        let filesToCheck = [];
        if (req.file) {
            filesToCheck.push(req.file)
        } else if (req.files && Array.isArray(req.files)) {
            filesToCheck = req.files;
        }

        // Helper function to clean up all files on disk if fail
        const cleanupAllFiles = async () => {
                for (const f of filesToCheck) {
                     console.log('deleting files')
                    console.log(f.path)
                    if (fsSync.existsSync(f.path)) 
                        await fs.unlink(f.path);
            };
        };
        
        try {
            for (const file of filesToCheck) {
                const meta = await fileTypeFromFile(file.path);

                // If file-type can't read it or it's not allowed
                if (!meta || !allowedTypes.includes(meta.mime)) {
                    console.log(`File verification failed for ${file.originalname}. Type found: ${meta ? meta.mime : 'unknown/text'}`);
                    
                    cleanupAllFiles(); // Wipe out everything uploaded in this request
                    return res.status(400).send('Error: File contents do not match permitted types.');
                };
            };

            
            next(); 
        
        } catch (err) {
            cleanupAllFiles();
            return res.status(500).send('Disallowed filetype');
        };
    };
};



// Delete
exports.deletePostMedia = async (filename) => {
    await fs.unlink(path.join('apps/shared/public/media/', filename));
};



// Delete
exports.deteleProfilePicture = async (filename) => {
    await fs.unlink(path.join('apps/shared/public/profile_images/', filename));
};
