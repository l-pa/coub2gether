const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const indexRouter = require('./routes/index');
const statusRouter = require('./routes/status');

<<<<<<< HEAD
const port = process.env.PORT || 8080; // HEROKU!!!!!!!
=======
const port = process.env.PORT || 8080;

// view engine setup
>>>>>>> parent of 43d1e4a... rng fixed
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/status', statusRouter);
app.use((req, res) => {
  res.status(404).render('error');
});
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
io.sockets.on('connection', (socket) => {
  socket.on('get all rooms', () => {
    socket.emit('rooms info', io.sockets.adapter.rooms);
  });
  socket.on('room', (room) => {
    socket.join(room);
    socket.on('sent link', (link) => {
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
