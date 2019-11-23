const jwt = require('../module/jwt');
const statusCode = require('../module/statusCode');
const util = require('./resUtil');
const resMessage = require('../module/responseMessage');

const authUtil = {
    LoggedIn: async (req, res, next) => {
        const token = req.headers.token;

        // 1. 토큰 존재하는지 확인
        if (!token) {
            return res.send('wrong parameter');
        }

        // 2. 토큰 유효한지 확인
        const result = jwt.verify(token);
        if (result === -1) {
            return res.status(statusCode.UNAUTHORIZED)
                .send(util.successFalse(resMessage.EXPIRED_TOKEN));
        }
        if (result === -2) {
            return res.status(statusCode.UNAUTHORIZED)
                .send(util.successFalse(resMessage.INVALID_TOKEN));
        }

        req.decoded = 1;
        next();
    }
}

module.exports = authUtil;