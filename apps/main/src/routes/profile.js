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
router.get('/:username', async (req, res) => {
    const { username } = req.params;

    let [data] = (await db.execute('SELECT * from users WHERE username = ?', [username]))[0] || {};

    // Omit data that shouldn't be visible on profile
    if (data){
        delete data["password_hash"]
        delete data["email"]
    }

    res.render('profile', {"user": req.session.user, "profile": data});
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

    res.render('profile', {"user": req.session.user, "profile": data});
});

// Display Follows
router.get('/:username/follows', async (req, res) => {
    const { username } = req.params;

    let [data] = (await db.execute('SELECT * from users WHERE username = ?', [username]))[0] || {};

    // Omit data that shouldn't be visible on profile
    if (data){
        delete data["password_hash"]
        delete data["email"]
    }

    res.render('profile', {"user": req.session.user, "profile": data});
});

// Export routes
module.exports = router;