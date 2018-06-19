var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);


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
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.sockets.on('connection', function (socket) {
  
  socket.on('room', function (room) {
    socket.join(room);
    var users;
    
    /*  io.in(room).clients((err, clients) => {
      socket.emit('users in room', clients);
    });*/
    
    socket.on('sent link', function (link) {
      io.in(room).emit('received link', link);
    });
    
    socket.on('username', function (username) {
      users[socket.id] = username;
      // socket.to(room).emit('user join', username);
      socket.to(room).emit('user join', username);
      socket.emit('users in room', users);
      console.log(users);
      
      socket.on('disconnect', function () {
        socket.to(room).emit('user left', username);
      });
    });
   
  });
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});

module.exports = app;
