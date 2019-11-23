var express = require('express');
var router = express.Router();
const pool = require('../module/poolAsync');

router.get('/', async (req, res) => {
  const result = await pool.queryParam_None(`SELECT * FROM product`);
  if (!result) {
    res.status(500).send('error');
    return;
  }
  res.status(200).send(result);
});

router.get('/basket/members/:memberId', async (req, res) => {
const {memberId} = req.params;

  const result = await pool.queryParam_Parse(`SELECT p.* FROM product p INNER JOIN basket b ON p.idx = b.product_idx WHERE b.user_idx = ?`, [memberId]);
  if (!result) {
    res.status(500).send('error');
    return;
  }
  res.status(200).send(result);
});

router.get('/storage/members/:memberId', async (req, res) => {
  const {memberId} = req.params;

  const result = await pool.queryParam_Parse(`SELECT p.* FROM product p INNER JOIN storage s ON p.idx = s.product_idx WHERE s.user_idx = ?`, [memberId]);
  if (!result) {
    res.status(500).send('error');
    return;
  }
  res.status(200).send(result);
});

router.get('/often/members/:memberId', async (req, res) => {
  const {memberId} = req.params;

  const result = await pool.queryParam_Parse(`SELECT p.* FROM product p INNER JOIN storage s ON p.idx = s.product_idx WHERE s.user_idx = ?`, [memberId]);
  if (!result) {
    res.status(500).send('error');
    return;
  }
  res.status(200).send(result);
});

router.get('/recent/members/:memberId', async (req, res) => {
  const {memberId} = req.params;

  const result = await pool.queryParam_Parse(`SELECT p.* FROM product p INNER JOIN storage s ON p.idx = s.product_idx WHERE s.user_idx = ?`, [memberId]);
  if (!result) {
    res.status(500).send('error');
    return;
  }
  res.status(200).send(result);
});

module.exports = router;
