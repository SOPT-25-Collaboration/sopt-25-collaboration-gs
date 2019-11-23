const express = require('express');
const router = express.Router();

const statusCode = require('../module/statusCode');

const responseMessage = require('../module/responseMessage');

const resUtil = require('../module/resUtil');
const authUtil = require('../module/authUtil');
const pool = require('../module/poolAsync');


router.post('/signup', async (req, res) => {
    const table = 'user';
    const {
        id,
        pw,
        name,
        phone_number,
    } = req.body;

    console.log(id, pwd, name, phone_number);
    const result = await pool.queryParam_None(`INSERT INTO ${table}`);

    if (!result) {
        res.status(500).send('error');
        return;
    }
    res.status(200).send(result);
});

module.exports = router;