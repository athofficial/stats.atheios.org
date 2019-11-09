var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('whatsnew', {
        title: 'Atheios API - What is new',
        version: version
    });
});

module.exports = router;