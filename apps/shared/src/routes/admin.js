const express = require('express');
const router = express.Router();

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const bcrypt = require('bcrypt');

const db = require('#config/db');

require('dotenv').config();

// Functions
router.post('/get-users', async (req, res) => {
    let data = await db.query('SELECT * FROM users')
    console.log(data)

})

// Export routes
module.exports = router;