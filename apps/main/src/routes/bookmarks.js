const express = require('express');
const router = express.Router();

const db = require('#config/db');

require('dotenv').config();

// Routes

// Display the profile page
router.get('/', async (req, res) => {
    if (!req.session.user?.id) return res.status(401).json({ error: 'Not logged in' });

    return res.render('bookmarks', {"user": req.session.user});
});


// Export routes
module.exports = router;