var express = require('express');
var router = express.Router();

router.use('/auth',require('./auth'));
router.use('/products',require('./product'));
router.use('/members',require('./member'));

module.exports = router;
