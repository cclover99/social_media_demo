const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const db = require('#config/db');
const dbService = require('#shared/src/services/dbService');
const mediaService = require('#shared/src/services/mediaService');
const loginService = require ('#shared/src/services/loginService')

require('dotenv').config();

// Routes

// Register
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) return res.json({ "ok": false });
    
    let [user_exists] = await db.execute('SELECT user_id FROM users WHERE email = ? OR username = ? OR email = ?', [email, username, email]);

    // If user exists then return
    if (user_exists.length !== 0) return res.status(401).send("A user with this email or username already exists");

    let hashed_password = await bcrypt.hash(password, 10);

    // Save the request into db
    await db.execute('INSERT INTO users (username, display_name, email, password_hash) VALUES (?, ?, ?, ?)', [username, username, email, hashed_password]);

    let [[user]] = await db.execute('SELECT user_id, username, display_name FROM users WHERE email = ? OR username = ? OR email = ?', [email, username, email]);

    console.log(user)
    loginService.login(req, res, user);
});


// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ "ok": false });

    let [[data]] = await db.execute('SELECT user_id, username, display_name, password_hash, profile_pic FROM users WHERE email = ?', [email]);


    const match = await bcrypt.compare(password, ( data?.password_hash || '' ));
    if (!match) return res.status(401).send("Wrong Password");

    
    loginService.login(req, res, data);
});


// Logout
router.post('/logout', async (req, res) => {    
    loginService.logout(req, res);
});


// Update Profile Picutre
router.post('/update-pfp', loginService.isLoggedIn, mediaService.profileUpload.single('picture'), mediaService.verifyFileType('profile'), async (req, res) => {
    const image_filename = req.file.filename;

    // Delete old picture if exists
    let [[{"profile_pic": old_filename}]] = await db.execute('SELECT profile_pic FROM users WHERE user_id = ?', [req.session.user.id]);
    

    if (old_filename){
        try 
            { await mediaService.deleteProfilePicture(old_filename) }
        catch 
            { console.log('Error deleting user profile picture'); return; };
    };
        

    await db.execute('UPDATE users SET profile_pic = ? WHERE user_id = ?', [image_filename, req.session.user.id]);

    req.session.user.profile_pic = image_filename;
    req.session.save(err => {
        if (err) console.error(err);
        return res.json({ "ok": true, image_filename });
    });
});

// Update banner
router.post('/update-banner', loginService.isLoggedIn, mediaService.profileUpload.single('picture'), mediaService.verifyFileType('profile'), async (req, res) => {
    const image_filename = req.file.filename;

    // Delete old picture if exists
    let [[{"banner": old_filename}]] = await db.execute('SELECT banner FROM users WHERE user_id = ?', [req.session.user.id]);
    

    if (old_filename){
        try 
            { await mediaService.deleteProfilePicture(old_filename) }
        catch 
            { console.log('Error deleting user old profile banner'); return; };
    };
        

    await db.execute('UPDATE users SET banner = ? WHERE user_id = ?', [image_filename, req.session.user.id]);

    return res.json({ "ok": true, image_filename });
});

router.post('/delete-banner', loginService.isLoggedIn, async (req, res) => {
    // Placeholder
});

router.post('/delete-pfp', loginService.isLoggedIn, async (req, res) => {
    // Placeholder
});


// Update general user data
router.post('/update-data', loginService.isLoggedIn, async (req, res) => {
    const { about, username, displayname, email } = req.body;

    // If updated info must be unique do checks
    if ( username || email){
        let [subQuery] = await db.execute('SELECT username, email FROM users WHERE username = ? OR email = ?', [username || '', email || '']);

        let details = [];

        if (subQuery.username && subQuery.username == username ){
            details.push('email');
        };

        if (subQuery.email && subQuery.email == email){
            details.push('email');
        };

        if (details.length){
            return res.json({ "ok": false, "details": details });
        };
    };
    
    
    
    let query = 'UPDATE users SET';

    let set = [];
    let parameters = [];

    if (about || about === '') {
        set.push('about = ?');
        parameters.push(about);
    };

    if (username) {
        set.push('username = ?');
        parameters.push(username);
        req.session.username = username;
    };

    if (displayname) {
        set.push('display_name = ?');
        parameters.push(displayname);
        req.session.displayname = displayname;
    };

    if (email) {
        set.push('email = ?');
        parameters.push(email);
    };

    if (set.length)
        query += ` ${set.join(', ')}`;

    // Set final query tail
    query += ' WHERE user_id = ?';
    parameters.push(req.session.user.id);

    

    // console.log(query, parameters);
    if ((about || about === '' )|| username || displayname || email){
        await db.execute(query, parameters);
    }else{
        return res.json({ "ok": false });
    };


    // If session needs to update then update
    if (displayname || username){
        req.session.user.username = username || req.session.user.username;
        req.session.user.displayname = displayname || req.session.user.displayname;

        req.session.save(err => {
            if (err) console.error(err);
            return res.json({ "ok": true });
        })
    } else{
        return res.json({ "ok": true });
    };
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
          u.username AS author_username, 
          u.display_name AS author_displayname,
          u.profile_pic 
    `;
    let filters = [];
    let where = [];

    let orderBy = `p.publish_date DESC, p.post_id DESC`;

    // If user logged in also check if liked or not
    if(req.session.user?.id){
        query += `
                , CASE WHEN l.user_id IS NULL THEN 0 ELSE 1 END AS isLiked
                , CASE WHEN b.user_id IS NULL THEN 0 ELSE 1 END AS isBookmarked
            FROM posts p 
            JOIN users u ON p.author_id = u.user_id
            LEFT JOIN likes l
            ON l.post_id = p.post_id
            AND l.user_id = ?
            LEFT JOIN bookmarks b
            ON b.post_id = p.post_id
            AND b.user_id = ?
        `;
        filters.push(req.session.user.id);
        filters.push(req.session.user.id);
    }else{
        query += `
            FROM posts p 
            JOIN users u ON p.author_id = u.user_id 
        `;
    };

    let last_post_date;
    if (last_post_id) {
        [[{"publish_date": last_post_date}]] = await db.execute('SELECT publish_date FROM posts WHERE post_id = ?', [last_post_id]);
        where.push(`
            (
                p.publish_date < ?
                OR (p.publish_date = ? AND p.post_id < ?)
            )
        `);
        filters.push(last_post_date, last_post_date, last_post_id);
    };
    
    try {
        if (author_name && page_type != "likes") {
            // Get certain author's posts
            where.push("u.username = ?");
            filters.push(author_name);

        } else if (page_type == "detailed") {
            // Detailed post view, load a single post
            where.push("p.post_id = ?");
            filters.push(post_id);

        } else if (page_type == "following" && req.session.user?.id) {
            // Get the following list of the author
            
            where.push(`
                p.author_id IN (
                    SELECT following_id
                    FROM follows
                    WHERE follower_id = ?
                )    
            `);
            filters.push(req.session.user.id);
         
            
            // await
            // where.push("follower_id");
            // filters.push(req.session.user.id);

        } else if (page_type == "comments") {
            // Comments section
            where.push("parent_post_id = ?");
            filters.push(post_id);
        };

        if (page_type == "replies") {
            // User's replies
            where.push("parent_post_id IS NOT NULL");
        } else if (page_type == "likes" && author_name) {
            // Join the likes table so we can access 'liked_at'
            query += ` JOIN likes lk ON p.post_id = lk.post_id `;
            
            // Filter by the user who liked the posts
            where.push(`lk.user_id = (SELECT user_id FROM users WHERE username = ?)`);
            filters.push(author_name);
            
            // Override the order to sort by the interaction time
            orderBy = `lk.liked_at DESC, p.post_id DESC`;
        } else if (page_type == "bookmarks"){
            // Join the bookmarks table so we can access 'bookmarked_at'
            query += ` JOIN bookmarks bk ON p.post_id = bk.post_id `;
            
            // Filter by the currently logged-in user
            where.push(`bk.user_id = ?`);
            filters.push(req.session.user?.id);
            
            // Override the order to sort by the interaction time
            orderBy = `bk.bookmarked_at DESC, p.post_id DESC`;
        };


        // If not displaying comments then filter out posts that has parent
        if (!["comments", "detailed", "following", "replies"].includes(page_type))
            where.push("parent_post_id IS NULL");

        // Where tail
        if (where.length)
            query += ` WHERE ${where.join(' AND ')}`;

        
        
        // Qyery tail
        query += ` ORDER BY ${orderBy} LIMIT 10`;


        // Mysql query
        // console.log(query, filters)
        const [data] = await db.query(query, filters);

        // Send back the data if exists, if not send empty
        res.json(data || []);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    };
});


// Create post
router.post('/create-post', loginService.isLoggedIn, mediaService.postUpload.array('media', 4), mediaService.verifyFileType('post'), async (req, res) => {
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

        await db.execute('UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = ?', [reply_to]);
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
    return res.redirect(referer || '/');

});


router.post('/delete-post', async (req, res) => {
    const {post_id} = req.body;
    if (!post_id) res.json({ "ok": false });

    const [[{author_id, parent_post_id, media}]] = (await db.execute('SELECT author_id, parent_post_id, media FROM posts WHERE post_id = ?', [post_id]));

    // If not owner of the post then skedaadle
    if (req.session.user?.id != author_id) {
        return res.status(401).json({ error: 'Forbidden' });
    };

    await dbService.deletePost(post_id);

    return res.json({ "ok": true });
});


router.post('/delete-account', loginService.isLoggedIn, async (req, res) => {
    // Check password in req.body
    const {password} = req.body;

    const [post_request] = await db.execute('SELECT post_id FROM posts WHERE author_id = ?', [req.session.user.id]);
    const posts = post_request.map(item => item.post_id)

    const [[{"profile_pic": avatar}]] = await db.execute('SELECT profile_pic FROM users WHERE user_id = ?', [req.session.user.id]);

    // Delete posts
    for (const post of posts){
        await dbService.deletePost(post);
    };

    // Delete avatar
    if (avatar){
        await mediaService.deleteProfilePicture(avatar);
    };

    const user_id = req.session.user.id;

    // Remove following and update
    // Update follower_count
    await db.execute(`
        UPDATE users AS u
        JOIN follows AS f ON f.follower_id = ?
        SET u.follower_count = u.follower_count - 1
        WHERE f.following_id = u.user_id
    `, [user_id]);

    // Update following_count
    await db.execute(`
        UPDATE users AS u
        JOIN follows AS f ON f.following_id = ?
        SET u.following_count = u.following_count - 1
        WHERE f.follower_id = u.user_id
    `, [user_id]);

    // Delete follow rows
    await db.execute(`
        DELETE FROM follows
        WHERE follower_id = ? OR following_id = ?
    `, [user_id, user_id]);



    // Remove likes from posts
    // Update like count
    await db.execute(`
        UPDATE posts AS p
        JOIN likes AS l ON l.post_id = p.post_id
        SET p.like_count = p.like_count - 1
        WHERE l.user_id = ?
    `, [user_id]);

    // Delete like
    await db.execute(`
        DELETE FROM likes WHERE user_id = ?
    `, [user_id]);


    // Remove bookmarks
    await db.execute(`DELETE FROM bookmarks WHERE user_id = ?`, [user_id]);


    // Finally delete user from database and log out
    await db.execute('DELETE FROM users WHERE user_id = ?', [user_id]);
    
    loginService.logout(req, res);
    
});


router.post('/like-post', loginService.isLoggedIn, async (req, res) => {
    const {post_id} = req.body;
    if (!post_id) res.json({ "ok": false });

    const [[is_liked]] = await db.execute("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?", [post_id, req.session.user.id]);

    if (!is_liked){
        // If not liked then like
        await db.execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.session.user.id, post_id]);
        // Insert like
        await db.execute('UPDATE posts SET like_count = like_count + 1 WHERE post_id = ?', [post_id]);
        res.json({ "ok": true });
    }else{
        // If liked then unlike
        await db.execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?;', [req.session.user.id, post_id]);
        // Insert unlike
        await db.execute('UPDATE posts SET like_count = like_count - 1 WHERE post_id = ?', [post_id])
        res.json({ "ok": true });
    };
});


router.post('/bookmark-post', async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });

    const {post_id} = req.body;
    if (!post_id) res.json({ "ok": false });

    const [[is_bookmarked]] = await db.execute("SELECT post_id FROM bookmarks WHERE post_id = ? AND user_id = ?", [post_id, req.session.user.id]);

    if (!is_bookmarked){
        // If not bookmarked then like
        await db.execute('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [req.session.user.id, post_id]);
        
        res.json({ "ok": true });
    }else{
        // If bookmarked then un-bookmark
        await db.execute('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?;', [req.session.user.id, post_id]);
        
        res.json({ "ok": true });
    };
    
});


router.post('/follow-user', loginService.isLoggedIn, async (req, res) => {
    const {user_id} = req.body;
    if (!user_id) res.json({ "ok": false });

    let is_following = false;
    if (req.session.user) {
        const [rows] = await db.execute("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?", [req.session.user.id, user_id]);

        is_following = rows.length > 0;
    }
    

    if (!is_following){
        // If not following then follow
        await db.execute('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.session.user.id, user_id]);

        // Insert follow
        await db.execute('UPDATE users SET following_count = following_count + 1 WHERE user_id = ?', [req.session.user.id]);
        await db.execute('UPDATE users SET follower_count = follower_count + 1 WHERE user_id = ?', [user_id]);
        res.json({ "ok": true });
    }else{
        // If not unfollow
        await db.execute('DELETE FROM follows WHERE follower_id = ? AND following_id = ?;', [req.session.user.id, user_id]);

        // Insert unfollow
        await db.execute('UPDATE users SET following_count = following_count - 1 WHERE user_id = ?', [req.session.user.id]);
        await db.execute('UPDATE users SET follower_count = follower_count - 1 WHERE user_id = ?', [user_id]);
        res.json({ "ok": true });
    };

});


// Export routes
module.exports = router;