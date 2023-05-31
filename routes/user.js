const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.get('/', userCtrl.one);
router.put('/:id', multer, userCtrl.update);
router.delete('/:id', userCtrl.delete);
router.patch('/status/:id', userCtrl.status);
router.patch('/repassword/:id', userCtrl.repassword);

module.exports = router;