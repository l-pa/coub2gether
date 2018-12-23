const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const request = require('request')

const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const indexRouter = require('./routes/index')
const statusRouter = require('./routes/status')
const appRouter = require('./routes/app')

const port = process.env.PORT || 8080 // HEROKU!!!!!!!

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/status', statusRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).render('error')
  //  next(createError(404));
})

function getCoubId(url) {
  const id = url.substring(url.lastIndexOf('/') + 1)
  return id
}

function validateYouTubeUrl(url) {
  if (url != undefined || url != '') {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/
    var match = url.match(regExp)
    if (match && match[2].length == 11) {
      // Do anything for being valid
      // if need to change the url to embed url then use below line

      return true
    } else {
      // Do anything for not being valid
      return false
    }
  }
}

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

function getRandomString(min, max) {
  return Math.random()
    .toString(36)
    .substr(2, Math.floor(Math.random() * (max - min + 1) + min))
}

function makeid() {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

  for (var i = 0; i < 11; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

io.sockets.on('connection', socket => {
  socket.on('get all rooms', () => {
    socket.emit('rooms info', io.sockets.adapter.rooms)
  })

  socket.on('room', room => {
    socket.join(room)
    var roomInfo = {}
    roomInfo.provider = io.sockets.adapter.rooms[room].provider
    roomInfo.lastLink = io.sockets.adapter.rooms[room].lastLink

    socket.emit('room info', roomInfo)

    function coubJson(link) {
      const url = `http://coub.com/api/oembed.json?url=http%3A//coub.com/view/${getCoubId(
        link
      )}` // undocumented coub api, works!

      request(url, { json: true }, (err, res, body) => {
        if (err) {
          return console.log(`${err}`)
        }
        if (body.title != null) {
          // socket.emit('history', body.title, body.permalink, body.small_picture);
          io.in(room).emit('received link coub', getCoubId(body.url))
          io.sockets.adapter.rooms[room].lastLink = getCoubId(body.url)

          io.in(room).emit(
            'history',
            body.title,
            getCoubId(body.url),
            body.thumbnail_url
          )
        } else {
          coubJson(getRandomString(4, 6))
        }
      })
    }

    function youtubeJson(id) {
      const url = 'http://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=' + id + '&format=json'
      request(url, { json: true }, (err, res, body) => {
        if (err) {
          return console.log(`${err}`)
        }
        console.log(body + ' ' + id)

        /* if (body.title != null) {
          // socket.emit('history', body.title, body.permalink, body.small_picture);
          io.in(room).emit('received link coub', getCoubId(body.url))
          io.sockets.adapter.rooms[room].lastLink = getCoubId(body.url)

          io.in(room).emit(
            'history',
            body.title,
            getCoubId(body.url),
            body.thumbnail_url
          )
        } else {
          coubJson(getRandomString(4, 6))
        } */
      })
    }

    socket.on('history link', link => {
      io.in(room).emit('received link coub', link)
    })

    socket.on('sent link', link => {
      if (validateYouTubeUrl(link)) {
        io.in(room).emit('received link youtube', link)
        io.sockets.adapter.rooms[room].provider = 'youtube'
      } else {
        coubJson(link)
        io.in(room).emit('received link coub', link)
        io.sockets.adapter.rooms[room].provider = 'coub'
      }
      io.sockets.adapter.rooms[room].lastLink = link
    })

    socket.on('rng coub', () => {
      coubJson(getRandomString(4, 6))
    })

    socket.on('rng youtube', () => {
      youtubeJson(makeid())
    })

    socket.on('message', (username, text) => {
      io.in(room).emit('message-received', username, text)
    })

    socket.on('youtube provider', () => {
      io.in(room).emit('youtube show')
      io.sockets.adapter.rooms[room].provider = 'youtube'
    })

    socket.on('coub provider', () => {
      io.in(room).emit('coub show')
      io.sockets.adapter.rooms[room].provider = 'coub'
    })

    socket.on('youtube event', (event, time) => {
      if (event.data == 3) {
        io.in(room).emit('youtube sync', time)
      }
      if (event.data == 2) {
        io.in(room).emit('youtube pause')
      }
      if (event.data == 1) {
        io.in(room).emit('youtube play')
      }
    })

    socket.on('youtube sync', (time) => {
      //   socket.to(room).emit('youtube sync', time)
      io.in(room).emit('youtube sync', time)
    })

    socket.on('username', (username) => {
      socket.username = username

      socket.to(room).emit('user join', socket.username)
      io.in(room).emit('username-join-notification', socket.username)

      const clients = io.sockets.adapter.rooms[room].sockets

      // to get the number of clients
      const numClients =
        typeof clients !== 'undefined' ? Object.keys(clients).length : 0

      for (const clientId in clients) {
        const clientSocket = io.sockets.connected[clientId]
        console.log(`Room : ${room} : ${clientSocket.username} : ${numClients}`)
        socket.emit('user join', clientSocket.username)
      }

      socket.on('disconnect', () => {
        socket.to(room).emit('user left', socket.username)
      })
    })
  })
})

http.listen(port, () => {
  console.log(`listening on *${port}`)
})

module.exports = app
