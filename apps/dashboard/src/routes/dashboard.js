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
    
    // If not admin then return
    if (!req.session.user?.isAdmin && false){
        return res.redirect(`${req.protocol}://${mainUrl}${port}/login`);
    }

    // Select everything except password_hash
    const user_fields = 'user_id, username, display_name, email, register_date, profile_pic, about, follower_count, following_count';
    const [users] = await db.query(`SELECT ${user_fields} FROM users`);


    return res.render('../views/index', {"user": req.session.user, "data": users});

});

// Export routes
module.exports = router;