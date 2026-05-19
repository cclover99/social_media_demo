const express = require('express');
const router = express.Router();

const db = require('#config/db');

require('dotenv').config();

// Routes
router.get('/', async (req, res) => {

    // Get hostname array
    // Remove the number of elements equal to the length of req.subdomains
    const hostParts = req.hostname.split('.');
    hostParts.splice(0, req.subdomains.length);

    // Join it back together (e.g., 'domainname.com' or 'localhost')
    const mainUrl = hostParts.join('.');
    const port = req.socket?.localPort ? `:${req.socket?.localPort}` : '';
    
    if (req.session.user?.isAdmin || true) {
        return res.render('../views/index', {"user": req.session.user})
    } else {
        return res.redirect(`${req.protocol}://${mainUrl}${port}/login`);
    };
});

// Export routes
module.exports = router;