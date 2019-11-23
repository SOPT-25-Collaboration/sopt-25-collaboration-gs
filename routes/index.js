var express = require('express');
var router = express.Router();

router.use('/auth',require('./auth'));
router.use('/products',require('./product'));


module.exports = router;
