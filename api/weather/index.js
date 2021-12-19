const express = require('express');
const {addCities} = require('./controller');
// eslint-disable-next-line new-cap
const router = express.Router();
router.route('/').post(addCities);
module.exports = router;
