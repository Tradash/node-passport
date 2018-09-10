var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const auth = require('./routes/auth');
const logoff = require('./routes/logoff');


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const user1 = [{l: 'q123', p: 'qwerty'},
							 {l: 'a123', p: 'asdfg'}];


passport.use(new LocalStrategy({
        usernameField: 'login',
        passwordField: 'password'
    }, 
    function (login, password, cb) {
			const authuser = user1.filter(elem => (elem.l === login) && (elem.p === password ));
			console.log('Проверка юзера по базе', authuser );
			if (!authuser) {
				console.log('Юзер не найден');
				return cb(null, false, {message: 'Incorrect email or password.'});
			} else {
				console.log('Юзер найден');
				return cb(null, login, {message: 'Logged In Successfully'});
			}
			}
));

const getjwt=(req) => {
	let token = null;
	if (req && req.cookies) {
		token = req.cookies['jwt'];}
	console.log('Кука', token)
	return token;
}

passport.use(new JWTStrategy({
        jwtFromRequest: getjwt,
        secretOrKey   : 'your_jwt_secret'
    },
    function (jwt_Payload, cb) {
			console.log('Проверка пользователя через куку', jwt_Payload);
			const authuser = user1.filter(elem => (elem.l === jwt_Payload.user));
			if (authuser.length != 0) {	
						console.log('Проверка пройдена');
			return cb(null, jwt_Payload); } 
			else { 
			console.log('Проверка не пройдена');
			return cb(null, false);}
    } 
));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log('/');
app.use('/', indexRouter);
console.log('/auth');
app.use('/auth', auth);


//app.use('/users', usersRouter);
console.log('/users');
app.use('/users', passport.authenticate('jwt', {session: false}), usersRouter);
console.log('/logoff');
app.use('/logoff', logoff);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
