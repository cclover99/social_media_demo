const express = require('express');
const router = express.Router();

const multer = require('multer');
const { fileTypeFromFile } = require('file-type');

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const bcrypt = require('bcrypt');

const db = require('#config/db');

require('dotenv').config();

// Functions

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../cdn/profile_images/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex'); // 32 chars
    cb(null, `${name}${ext}`);
  }
});

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../cdn/media/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex'); // 32 chars
    cb(null, `${name}${ext}`);
  }
});

const profileUpload = multer({ 
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

const mediaUpload = multer({ 
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

// Routes

// Register
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    
    let [user] = await db.execute('SELECT user_id FROM users WHERE email = ? OR username = ? OR email = ?', [email, username, email]);

    // If user exists then return
    if (user.length !== 0) return res.status(401).send("A user with this email or username already exists");

    let hashed_password = await bcrypt.hash(password, 10);

    // Save the request into db
    await db.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashed_password]);

    req.session.user = {
        "id": user.user_id,
        "username": user.username,
        "displayName": user.displayName || null
    };

    req.session.save();

    res.redirect('/');

});


// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    let [data] = (await db.execute('SELECT user_id, username, display_name, password_hash, profile_pic FROM users WHERE email = ?', [email]))[0];


    const match = await bcrypt.compare(password, ( data?.password_hash || '' ));
    if (!match) return res.status(401).send("Wrong Password");

    

    req.session.user = {
        "id": data.user_id,
        "username": data.username,
        "displayName": data.display_name,
        "profile_pic": data.profile_pic
    };

    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    req.session.save(err => {
        if (err) console.error(err);
        return res.redirect(302, '/');
    });
});


// Logout
router.post('/logout', async (req, res) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    req.session.destroy(err => {
        if (err) console.error(err);
        return res.redirect(302, '/');
    });
});


// Update Profile Picutre
router.post('/update-pfp', profileUpload.single('picture'), async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });

    const image_filename = req.file.filename;

    // Delete old picture if exists
    let old_filename = ((await db.query('SELECT profile_pic FROM users WHERE user_id = ?', [req.session.user.id]))[0][0])["profile_pic"];
    if (old_filename) try{ await fs.unlink(path.join(__dirname, '../../cdn/profile_images/', old_filename))} catch{ console.log('Error deleting user profile picture')};

    await db.query('UPDATE users SET profile_pic = ? WHERE user_id = ?', [image_filename, req.session.user.id]);

    req.session.user.profile_pic = image_filename;
    req.session.save(err => {
        if (err) console.error(err);
        res.json({ "ok": true, image_filename });
    });
});


// Get posts
router.post('/get-posts', async (req, res) => {
    const {author_name, post_id, last_post_id, is_follow_page, is_comment_page, page_type} = req.body || {};

    let query = `
        SELECT 
          p.post_id,
          p.author_id, 
          p.content, 
          p.publish_date, 
          p.media,
          p.like_count,
          p.comment_count,
          u.username, 
          u.profile_pic 
    `;
    let filters = [];
    let where = [];

    // If user logged in also check if liked or not
    if(req.session.user?.id){
        query += `
              ,CASE WHEN l.user_id IS NULL THEN 0 ELSE 1 END AS is_liked
            FROM posts p 
            JOIN users u ON p.author_id = u.user_id
            LEFT JOIN likes l
              ON l.post_id = p.post_id
              AND l.user_id = ?
        `;
        filters.push(req.session.user.id);
    }else{
        query += `
            FROM posts p 
            JOIN users u ON p.author_id = u.user_id 
        `;
    }

    

    let last_post_date;
    if (last_post_id) {
        [[{"publish_date": last_post_date}]] = await db.query('SELECT publish_date FROM posts WHERE post_id = ?', [last_post_id]);
        where.push(`
            (
                p.publish_date < ?
                OR (p.publish_date = ? AND p.post_id < ?)
            )
        `);
        filters.push(last_post_date, last_post_date, last_post_id);
    };
    
    try {
        if (author_name){
            // Get certain author's posts
            where.push("u.username = ?");
            filters.push(author_name);
        }
        
        else if (page_type == "detailed"){
            // Detailed post view, load a single post
            where.push("p.post_id = ?");
            filters.push(post_id);
        } 
        
        else if (page_type == "following" && req.session.user?.id){
            // Get the following list of the author
            const [[following]] = await db.query('SELECT following_id FROM follows WHERE follower_id = ?', req.session.user.id);

            if (following){
                where.push("author_id = ?");
                filters.push(post_id);
            }else{
                res.json([]);
                return;
            }
            
            // await
            // where.push("follower_id");
            // filters.push(req.session.user.id);
        } else if (page_type == "comments"){
            // Comments section
            where.push("parent_post_id = ?");
            filters.push(post_id);
        }

        if (page_type == "replies"){
            // User's replies
            where.push("parent_post_id IS NOT NULL");
        }


        // If not displaying comments then filter out posts that has parent
        if (!["comments", "detailed", "following", "replies"].includes(page_type))
            where.push("parent_post_id IS NULL");

        // Where tail
        if (where.length)
            query += ` WHERE ${where.join(' AND ')}`;

        // Shared query tail
        if (page_type != "following")
            query += ` ORDER BY p.publish_date DESC, p.post_id DESC LIMIT 10`;


        // Mysql query
        const [data] = await db.execute(query, filters);

        // Send back the data if exists, if not send empty
        res.json(data || []);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});


// Create post
router.post('/create-post', mediaUpload.array('media', 6), async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });
    const {content} = req.body;

    if (!content && !req.files) return res.status(401).json({ error: "You can't make an empty post" });
    
    const referer = req.get('referer');
    const pathname = new URL(referer || '').pathname;
    const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    let reply_to = cleanPath.split('/post/')[1];

    let query = `INSERT INTO posts `;
    let insert = [];
    let parameters = [];

    insert.push("author_id");
    insert.push("content");

    parameters.push(req.session.user.id);
    parameters.push(content);

    if (reply_to){ 
        insert.push("parent_post_id");
        parameters.push(Number(reply_to));

        await db.query('UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = ?', [reply_to]);
    };

    // If media push into parameters
    if (req.files?.length){
        insert.push('media');
        parameters.push([JSON.stringify(req.files.map(file => file.filename))]);
    }

    // Complete query
    if (insert.length){
        query += ` (${insert.join(', ')}) `;
        query += ` VALUES (${ Array(insert.length).fill('?').join(', ') }) `;
    };

    await db.execute(query, parameters);
    res.redirect(referer);

});

router.post('/delete-post', async (req, res) => {
    const {post_id} = req.body;

    const [{author_id, parent_post_id, media}] = (await db.query('SELECT author_id, parent_post_id, media FROM posts WHERE post_id = ?', [post_id]))[0];

    if (media?.length){
        for (const m of JSON.parse(media[0])){
            try{ 
                await fs.unlink(path.join(__dirname, '../../cdn/media/', m));
            } catch{ 
                console.log('Error deleting post media');
            };
        };
    };

    if (parent_post_id){
        await db.query('UPDATE posts SET comment_count = comment_count - 1 WHERE post_id = ?', [parent_post_id]);
    }

    if (req.session.user?.id == author_id){
        await db.query('DELETE FROM posts WHERE post_id = ?', [post_id]);
        await db.query('DELETE FROM likes WHERE post_id = ?', [post_id]);

        res.json({ "ok": true });
        return;
    }else{
        res.status(401).json({ error: 'Forbidden' })
        return;
    };
});

router.post('/delete-account', async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });

    const user_id = req.session.user.id;

    let media = [];

    // Get and delete posts, remove any likes and subposts associated with posts
    // code

    // Get and Delete media
    if (media?.length){
        for (const m of JSON.parse(media[0])){
            try{ 
                await fs.unlink(path.join(__dirname, '../../cdn/media/', m));
            } catch{ 
                console.log('Error deleting post media');
            };
        };
    };

    if (req.session.user?.id == author_id){
        await db.query('DELETE FROM posts WHERE post_id = ?', [post_id]);
    }else{
        res.status(401).json({ error: 'Forbidden' })
    };

    // Get and delete user profile picutre
    // code

    // Get and delete follows and update related follows
    // 

    // Get and delete likes
    // code

    // res.redirect(req.get('Referrer') || '/');
    res.redirect('/');
});

router.post('/like-post', async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });

    const {post_id} = req.body;

    const [[is_liked]] = await db.query("SELECT post_id FROM likes WHERE post_id = ? AND user_id = ?", [post_id, req.session.user.id]);

    if (!is_liked){
        // If not liked then like
        await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.session.user.id, post_id]);
        // Insert like
        await db.query('UPDATE posts SET like_count = like_count + 1 WHERE post_id = ?', [post_id]);
        res.json({ "ok": true });
    }else{
        // If liked then unlike
        await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?;', [req.session.user.id, post_id]);
        // Insert unlike
        await db.query('UPDATE posts SET like_count = like_count - 1 WHERE post_id = ?', [post_id])
        res.json({ "ok": true });
    };
});

router.post('/bookmark-post', async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });

    const {post_id} = req.body;
    
});

router.post('/follow-user', async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });

    const {user_id} = req.body;

    const [[is_following]] = await db.query("SELECT post_id FROM follows WHERE post_id = ? AND user_id = ?", [post_id, req.session.user.id]);

    if (!is_following){
        // If not following then follow
        await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.session.user.id, post_id]);

        // Insert follow
        await db.query('UPDATE users SET following_count = following_count + 1 WHERE user_id = ?', [req.session.user.id]);
        await db.query('UPDATE users SET follower_count = following_count + 1 WHERE user_id = ?', [user_id]);
        res.json({ "ok": true });
    }else{
        // If not unfollow
        await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?;', [req.session.user.id, post_id]);

        // Insert unfollow
        await db.query('UPDATE users SET following_count = following_count - 1 WHERE user_id = ?', [req.session.user.id]);
        await db.query('UPDATE users SET follower_count = following_count - 1 WHERE user_id = ?', [user_id]);
        res.json({ "ok": true });
    };

});


// Export routes
module.exports = router;