const express = require('express');
const path = require('path');
var router = express.Router();


/* GET home page. */
router.get(['/', '//', '/index.html'], async function(req, res, next) {
  // Use path.join to create an absolute path to your file
  res.send('Certisfy Claim Recipes')
});

module.exports = router;
