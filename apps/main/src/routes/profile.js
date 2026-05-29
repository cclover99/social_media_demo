const express = require('express');
const router = express.Router();

const db = require('#config/db');

require('dotenv').config();

// Routes

// Redirect root of profiles directory to main index
router.get('/', async (req, res) => {
    res.redirect(301, '/');
});


// Display the profile page
router.get(['/:username/', '/:username/likes', '/:username/replies'], async (req, res) => {
    const { username, page_type } = req.params;

    let [data] = (await db.execute('SELECT * from users WHERE username = ?', [username]))[0] || null;

    
    let is_following = false;

    if (req.session.user) {
        const [rows] = await db.execute("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?", [req.session.user.id, data?.user_id || '']);

        is_following = rows.length > 0;
    };

    if (req.path.endsWith('/likes') && ( data?.user_id != req.session.user?.id )){
        return res.redirect(`/u/${username}`);
    };

    // Omit data that shouldn't be visible on profile anyways
    if (data){
        delete data["password_hash"];
        delete data["email"];
    };

    return res.render('profile', {"user": req.session.user, "profile": data, "is_following": is_following });
});

// Display Followers
router.get('/:username/followers', async (req, res) => {
    const { username } = req.params;

    let [data] = (await db.execute('SELECT * from users WHERE username = ?', [username]))[0] || {};

    // Omit data that shouldn't be visible on profile
    if (data){
        delete data["password_hash"]
        delete data["email"]
    }

    res.redirect(`/u/${username}`)
    // res.render('profile', {"user": req.session.user, "profile": data});
});

// Display Follows
router.get('/:username/following', async (req, res) => {
    const { username } = req.params;

    let [data] = (await db.execute('SELECT * from users WHERE username = ?', [username]))[0] || {};

    // Omit data that shouldn't be visible on profile
    if (data){
        delete data["password_hash"]
        delete data["email"]
    }

    res.redirect(`/u/${username}`)
    // res.render('profile', {"user": req.session.user, "profile": data});
});

// Export routes
module.exports = router;