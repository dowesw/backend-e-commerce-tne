const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const multer = require('../middleware/multer-config');

router.post('/login', userCtrl.login);
router.post('/signup', multer, userCtrl.create);

module.exports = router;