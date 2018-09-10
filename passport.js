const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const user = [{l: 'q123', p: 'qwerty'},
							{l: 'a123', p: 'asdfg'}];
				


passport.use(new LocalStrategy({
        usernameField: 'login',
        passwordField: 'password'
    }, 
    function (login, password, cb) {
				
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT

			const authuser = user.filter(elem => (elem.l === login) && (elem.p === password ));

				if (authuser.length === 0) {
					return cb(null, false, {message: 'Incorrect email or password.'});
				} else {
					return cb(null, user, {message: 'Logged In Successfully'});}

/*        return UserModel.findOne({login, password})
           .then(user => {
               if (!user) {
                   return cb(null, false, {message: 'Incorrect email or password.'});
               }

               return cb(null, user, {message: 'Logged In Successfully'});
          })
          .catch(err => cb(err)); */
    } 
));

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'your_jwt_secret'
    },
    function (jwtPayload, cb) {

			const authuser = user.filter(elem => (elem.l === jwtPayload.id));
			if (authuser.length != 0) {	return cb(null, jwtPayload.id); } 

        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
/*        return UserModel.findOneById(jwtPayload.id)
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            }); */
    } 
));
