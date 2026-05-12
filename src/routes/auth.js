const express = require('express');
const router = express.Router();

const db = require('../config/db');

require('dotenv').config();

// Routes

router.get('/login', async (req, res) => {
    if (req.session.user?.id){
        res.redirect(301, '/');
        return;
    }

    res.render('auth', {"action": "login"});
});

router.get('/register', async (req, res) => {
    if (req.session.user?.id){
        res.redirect(301, '/');
        return;
    }
        

    res.render('auth', {"action": "register"});
});

router.get('/settings', async (req, res) => {
    if (!req.session.user?.id){
        res.redirect(301, '/');
        return;
    }
        
    let [data] = (await db.execute(`SELECT * FROM users WHERE user_id = ?`, [req.session.user?.id]))[0];

    res.render('settings', { 
        "user": req.session.user,
        "credentials": {
            "email": data.email,
            "about": data.about
        }
    });
});

// Export routes
module.exports = router;