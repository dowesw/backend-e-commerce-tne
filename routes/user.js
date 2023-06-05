const express = require('express');
const router = express.Router();

const controller = require('../controllers/user');
const multer = require('../middleware/multer-config');

router.get('/', controller.findOne);
router.put('/:id', multer, controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/status', controller.status);
router.patch('/:id/repassword', controller.repassword);

module.exports = router;