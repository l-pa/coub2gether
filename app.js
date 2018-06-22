const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

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
  socket.on('room', (room) => {
    socket.join(room);

    /*  io.in(room).clients((err, clients) => {
      socket.emit('users in room', clients);
  }); */

    socket.on('sent link', (link) => {
      io.in(room).emit('received link', link);
    });


    socket.on('username', (username) => {
      socket.username = username;
      socket.to(room).emit('user join', socket.username);
      socket.emit('username', socket.username);
      const clients = io.sockets.adapter.rooms[room].sockets;

      // to get the number of clients
      const numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;

      for (const clientId in clients) {
        // this is the socket of each client in the room.
        const clientSocket = io.sockets.connected[clientId];

        // you can do whatever you need with this
        console.log(`Room : ${room} : ${clientSocket.username}`);
        socket.emit('user join', clientSocket.username);

       // io.in(room).emit('user join', socket.username);
      }

      socket.on('disconnect', () => {
        socket.to(room).emit('user left', socket.username);
      });
    });
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

module.exports = app;
