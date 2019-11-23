var express = require('express');
var router = express.Router();
const pool = require('../module/poolAsync');
const statusCode = require('../module/statusCode');
const resMessage = require('../module/responseMessage');
const resUtil = require('../module/resUtil');
const upload = require('../config/multer');

router.post('/', upload.single('image'), async (req, res) => {
  const {name, price} = req.body;
  const imageUrl = req.file.location;
  pool.queryParam_Parse(`INSERT INTO product(name, price, image_url) VALUES(?, ?, ?)`, [name, price, imageUrl])
  .then((result) => {
    res.status(statusCode.OK).send(resUtil.successTrue(statusCode.OK, resMessage.PRODUCT_CREATE_SUCCESS));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_CREATE_FAIL));
  });
});

router.get('/', async (req, res) => {
  pool.queryParam_None(`SELECT * FROM product`)
  .then((result) => {
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_READ_ALL_SUCCESS, result));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_READ_ALL_FAIL));
  });
});

router.get('/:productId/members/:memberId', async (req, res) => {
  const {productId, memberId} = req.params;
  pool.queryParam_Parse(`SELECT * FROM product WHERE idx = ?`, [productId])
  .then((result) => {
    pool.queryParam_Parse(`INSERT INTO view_log(user_idx, product_idx) VALUES(?, ?)`, [memberId, productId]);
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_READ_ALL_SUCCESS, result));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_READ_ALL_FAIL));
  });
});

router.put('/:productId', upload.single('image'), async (req, res) => {
  const {productId} = req.params;
  const {name, price} = req.body;
  const imageUrl = req.file.location;
  pool.queryParam_Parse(`UPDATE product SET name = ?, price = ?, image_url = ? WHERE idx = ?`, [name, price, imageUrl, productId])
  .then((result) => {
    if(result.changedRows === 0){
      return res.status(statusCode.BAD_REQUEST).send(resUtil.successTrue(resMessage.NO_PRODUCT));
    }
    res.status(statusCode.OK).send(resUtil.successTrue(statusCode.OK, resMessage.PRODUCT_UPDATE_SUCCESS));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_UPDATE_FAIL));
  });
});

router.delete('/:productId', async (req, res) => {
  const {productId} = req.params;
  pool.queryParam_Parse(`DELETE FROM product WHERE idx = ?`, [productId])
  .then((result) => {
    if(result.affectedRows === 0){
      return res.status(statusCode.BAD_REQUEST).send(resUtil.successTrue(resMessage.NO_PRODUCT));
    }

    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_DELETE_SUCCESS));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_DELETE_FAIL));
  });
});

router.get('/members/:memberId/basket', async (req, res) => {
  const {memberId} = req.params;

  pool.queryParam_Parse(
    `SELECT b.idx, p.idx AS product_idx, p.name, p.image_url
    FROM product p 
      INNER JOIN basket b 
      ON p.idx = b.product_idx 
    WHERE b.user_idx = ? 
    ORDER BY b.create_time DESC`, [memberId])
  .then((result) => {
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_READ_BASKET_SUCCESS, result));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_READ_BASKET_FAIL));
  });
});

router.post('/:productId/members/:memberId/basket', async (req, res) => {
  const {productId, memberId} = req.params;

  pool.queryParam_Parse(`INSERT INTO basket(user_idx, product_idx) VALUES(?, ?)`, [memberId, productId])
  .then((result) => {
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_ADD_BASKET_SUCCESS));
  })
  .catch((err) => {
    console.log(err);
    if(err.errno === 1062){
      return res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_ADD_BASKET_FAIL_DUPLICATE));
    }
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_ADD_BASKET_FAIL));
  });
});

router.delete('/basket/:basketId', async (req, res) => {
  const {basketId} = req.params;
  pool.queryParam_Parse(`DELETE FROM basket WHERE idx = ?`, [basketId])
  .then((result) => {
    if(result.affectedRows === 0){
      return res.status(statusCode.BAD_REQUEST).send(resUtil.successTrue(resMessage.NO_BASKET));
    }

    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_DELETE_BASKET_SUCCESS));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_DELETE_BASKET_FAIL));
  });
});

router.get('/members/:memberId/storage', async (req, res) => {
  const {memberId} = req.params;

  pool.queryParam_Parse(
    `SELECT s.idx, p.idx AS product_idx, p.name, p.image_url, s.create_time, s.used 
    FROM product p 
      INNER JOIN storage s 
      ON p.idx = s.product_idx 
    WHERE s.user_idx = ? 
    ORDER BY s.create_time DESC`, [memberId])
  .then((result) => {
    for(var i = 0; i<result.length; i++){
      if(result[i].used === 1){
        result[i]['used'] = true;
      }else{
        result[i]['used'] = false;
      }
    }
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_READ_STORAGE_SUCCESS, result));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_READ_STORAGE_FAIL));
  });
});

router.post('/:productId/members/:memberId/storage', async (req, res) => {
  const {productId, memberId} = req.params;

  pool.queryParam_Parse(`INSERT INTO storage(user_idx, product_idx) VALUES(?, ?)`, [memberId, productId])
  .then((result) => {
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_ADD_STORAGE_SUCCESS));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_ADD_STORAGE_FAIL));
  });
});

router.patch('/storage/:storageId', async (req, res) => {
  const {storageId} = req.params;

  pool.queryParam_Parse(`UPDATE storage SET used = 1 WHERE idx = ?`, [storageId])
  .then((result) => {
    if(result.affectedRows === 0){
      return res.status(statusCode.BAD_REQUEST).send(resUtil.successTrue(resMessage.NO_STORAGE));
    }else if(result.changedRows === 0){
      return res.status(statusCode.BAD_REQUEST).send(resUtil.successTrue(resMessage.PRODUCT_USE_STORAGE_FAIL_ALREADY_USE));
    }

    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_USE_STORAGE_SUCCESS));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_USE_STORAGE_FAIL));
  });
});

router.get('/members/:memberId/often', async (req, res) => {
  const {memberId} = req.params;

  pool.queryParam_Parse(
    `SELECT p.* 
    FROM product p 
      INNER JOIN (SELECT * 
        FROM view_log 
        WHERE user_idx = ?) v 
      ON p.idx = v.product_idx 
    GROUP BY p.idx 
    HAVING COUNT(p.idx) > 1 
    ORDER BY COUNT(p.idx) DESC`, [memberId])
  .then((result) => {
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_READ_OFTEN_SUCCESS, result));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_READ_OFTEN_FAIL));
  });
});

router.get('/members/:memberId/recent', async (req, res) => {
  const {memberId} = req.params;

  pool.queryParam_Parse(
    `SELECT p.*, v2.create_time 
    FROM product p 
      INNER JOIN (
        SELECT v.product_idx, MAX(v.create_time) AS create_time 
        FROM view_log v 
        WHERE v.user_idx = 1 
        GROUP BY v.product_idx) v2 
      ON p.idx = v2.product_idx 
    ORDER BY v2.create_time DESC`, [memberId])
  .then((result) => {
    res.status(statusCode.OK).send(resUtil.successTrue(resMessage.PRODUCT_READ_RECENT_SUCCESS, result));
  })
  .catch((err) => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(resUtil.successFalse(resMessage.PRODUCT_READ_RECENT_FAIL));
  });
});

module.exports = router;
