const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../Controller/userController');
const { protectUser } = require('../Middelware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protectUser, getUserProfile);

module.exports = router;
