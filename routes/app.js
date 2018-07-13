const express = require('express')

const router = express.Router()

let roomId

router.get('/', (req, res) => {
  roomId = Math.random()
    .toString(36)
    .substring(7)
  res.redirect(`/room/${roomId}`)
})

router.get('/room/:roomid', (req, res) => {
  roomId = req.params.roomid
  res.render('app', { title: 'Coub2Gether', room: roomId })
})

module.exports = router
