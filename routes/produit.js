const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const controller = require('../controllers/produit');

router.get('/', auth, controller.findAll);
router.get('/:id', auth, controller.findOne);
router.post('/', auth, multer, controller.create);
router.put('/:id', auth, multer, controller.update);
router.delete('/:id', auth, controller.delete);
router.patch('/:id/like', auth, controller.likeOrNot)
module.exports = router;