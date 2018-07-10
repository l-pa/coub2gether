const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const request = require('request');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const indexRouter = require('./routes/index');
const statusRouter = require('./routes/status');
const appRouter = require('./routes/app');

const port = process.env.PORT || 8080; // HEROKU!!!!!!!


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/status', statusRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).render('error');
  //  next(createError(404));
});

function getCoubId (url) {
  const id = url.substring(url.lastIndexOf('/') + 1);
  return id;
}


// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.sockets.on('connection', (socket) => {
  socket.on('get all rooms', () => {
    socket.emit('rooms info', io.sockets.adapter.rooms);
  });

  socket.on('room', (room) => {
    socket.join(room);

    // json parse not working as expected :(
    function getJson (link) {
      const urlA = `https://cors.io/?http://coub.com/api/v2/coubs/${getCoubId(link)}`;
      const url = `http://coub.com/api/oembed.json?url=http%3A//coub.com/view/${getCoubId(link)}`;
      console.log(url);
      const urlB = `http://coub.com/api/v2/coubs/${link}`;

      request(url, { json: true }, (err, res, body) => {
        if (err) { return console.log(`${err}`); }
        if (body.title != null) {
        // socket.emit('history', body.title, body.permalink, body.small_picture);
          io.in(room).emit('history', body.title, getCoubId(body.url), body.thumbnail_url);
        }
      });
    }

    socket.on('history link', (link) => {
      io.in(room).emit('received link', link);
    });

    socket.on('sent link', (link) => {
      getJson(link);
      io.in(room).emit('received link', link);
    });

    socket.on('rng', (link) => {
      getJson(link);
      io.in(room).emit('received link', link);
    });

    socket.on('message', (username, text) => {
      io.in(room).emit('message-received', username, text);
    });

    socket.on('username', (username) => {
      socket.username = username;
      socket.to(room).emit('user join', socket.username);
      io.in(room).emit('username-join-notification', socket.username);

      const clients = io.sockets.adapter.rooms[room].sockets;

      // to get the number of clients
      const numClients = typeof clients !== 'undefined' ? Object.keys(clients).length : 0;

      for (const clientId in clients) {
        const clientSocket = io.sockets.connected[clientId];
        console.log(`Room : ${room} : ${clientSocket.username}`);
        socket.emit('user join', clientSocket.username);
      }

      socket.on('disconnect', () => {
        socket.to(room).emit('user left', socket.username);
      });
    });
  });
});


http.listen(port, () => {
  console.log(`listening on *${port}`);
});

module.exports = app;
