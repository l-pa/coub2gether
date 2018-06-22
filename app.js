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
    let users;

    /*  io.in(room).clients((err, clients) => {
      socket.emit('users in room', clients);
  }); */

    socket.on('sent link', (link) => {
      io.in(room).emit('received link', link);
    });
    socket.on('username', (username) => {
      users[socket.id] = username;
      // socket.to(room).emit('user join', username);
      socket.to(room).emit('user join', username);
      socket.emit('users in room', users);
      console.log(users);
      socket.on('disconnect', () => {
        socket.to(room).emit('user left', username);
      });
    });
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

module.exports = app;
