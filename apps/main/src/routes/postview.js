const express = require('express');
const router = express.Router();

const db = require('#config/db');

require('dotenv').config();

// Routes
router.get('/:username/post/:postid', async (req, res) => {
    const { postid } = req.params;

    let [data] = (await db.execute(`
        SELECT p.*, u.username AS author_name, u.profile_pic AS avatar,

        -- Check user interaction
        IF(l.user_id IS NOT NULL, 1, 0) AS isLiked,
        IF(b.user_id IS NOT NULL, 1, 0) AS isBookmarked

        FROM posts p
        INNER JOIN users u ON p.author_id = u.user_id

        -- Left join likes
        LEFT JOIN likes l ON p.post_id = l.post_id AND l.user_id = ?
    
        -- Left join bookmarks
        LEFT JOIN bookmarks b ON p.post_id = b.post_id AND b.user_id = ?


        WHERE p.post_id = ?
    `, [req.session.user?.id || -1, req.session.user?.id || -1, (isNaN(postid) ? -1 : postid)] ) )[0] || null;

    if (!data) console.log('post not found')

    return res.render('post', {"user": req.session.user, "post": data});
});

// Export routes
module.exports = router;