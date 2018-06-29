var express = require("express");
var router = express.Router();

var roomId;

router.get("/", function(req, res) {
  res.render("index");
});

router.get("/room/:roomid", function(req, res) {
  roomId = req.params.roomid;
  res.render("app", { title: "Coub2gether", room: roomId });
});

module.exports = router;
