const mysql = require('promise-mysql');

const dbConfig = {
    host: 'sticket.cmnxncxddliv.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'sticket',
    password: '1q2w3e4r!',
    database: 'sopt_gs'
}

module.exports = mysql.createPool(dbConfig);