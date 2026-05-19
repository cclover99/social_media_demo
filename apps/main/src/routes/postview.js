const express = require('express');
const router = express.Router();

const db = require('#config/db');

require('dotenv').config();

// Routes
router.get('/:username/post/:postid', async (req, res) => {
    const { postid } = req.params;

    let [data] = (await db.execute('SELECT * from posts WHERE post_id = ?', [postid]))[0] || {};

    if (!data){
        res.render('post', {"user": req.session.user, "post": "None"});
    }else{
        res.render('post', {"user": req.session.user, "post": data});
    }

    
});

// Export routes
module.exports = router;