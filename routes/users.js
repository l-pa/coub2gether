const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.send(io.sockets.adapter.rooms);
});

module.exports = router;
