var express = require("express");
var router = express.Router();

var roomId;

router.get("/", function(req, res) {
  roomId = Math.random()
    .toString(36)
    .substring(7);
  res.redirect("/room/" + roomId);
});

router.get("/room/:roomid", function(req, res) {
  roomId = req.params.roomid;
  res.render("index", { title: "Coub2gether", room: roomId });
});

module.exports = router;
