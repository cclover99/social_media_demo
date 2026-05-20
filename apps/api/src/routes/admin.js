const express = require('express');
const router = express.Router();

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const bcrypt = require('bcrypt');

const db = require('#config/db');

require('dotenv').config();

// Functions

// Export routes
module.exports = router;