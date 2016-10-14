/**
 * Dependencies
 */
var jwt          = require('jwt-simple');
var moment       = require('moment');
var utils        = require('../utils/utils');
var users_config = require('../config/config_'+global.env).users;
var config       = require('../config/config_'+global.env).config;
var logging      = new utils.logging();
var superSecret  = users_config.JWTSecret;
var tokenExpiry  = users_config.JWTexpiry;

var logger       = require('../utils/logger');

var async = require('async');
var sanitize         = require('../utils/utils').sanitize; // For removing scripts from user input.


// authenticate user and return a token
exports.authenticate = function (req, res) {

	// req.body = typeof req.body === typeof '' ? JSON.parse(sanitize(req.body)) : sanitize(req.body);

	//sanitizizng twice just to avoid any possible 'xss verification'
	var username = sanitize(req.body.username);
	var password = sanitize(req.body.password);

	// logging.req = req;
	// logger.info('Authentication request for the user ' + req.body.email);
	logging.log('[ USERS CONTROLLER ] Authentication request for the user ' + username);
	logger.info('[ USERS CONTROLLER ] Authentication request for the user ' + username);

	if (typeof username === 'undefined' || !(config.login.users.indexOf(username) > -1)) {
    	logging.err('[ USERS CONTROLLER ] Authentication failed. Username not provided or Invalid: ' + username);
    	logger.error('[ USERS CONTROLLER ] Authentication failed. Username not provided or Invalid: ' + username);
		return res.send(401, {
      		success: false,
      		code: 401, 
      		message: 'Authentication failed. Username not provided or Invalid: ' + username 
    	});
	}

	if (typeof password === 'undefined' || password != config.login.password) {
    	logging.err('[ USERS CONTROLLER ] Authentication failed. Password not provided or Invalid.');
    	logger.error('[ USERS CONTROLLER ] Authentication failed. Password not provided or Invalid.');
		return res.send(401, { 
      		success: false,
      		code: 401, 
      		message: 'Authentication failed. Password not provided or Invalid.'
    	});
	}

	if(true){ //if the user exists in the whitelisted users 
		var corpUser = {};
	     corpUser.uid = username;
	     corpUser.displayName = username;
	     corpUser.mail = username + '@Social-Media-NodeJs.com';
			
		// user has successfully authenticated, so we can generate and send them a token.
		var expires = moment().add(tokenExpiry.value, tokenExpiry.type).valueOf();
		var	token;


		var condition = {id : corpUser.uid};
		 // create the token
			token = jwt.encode({
	    		user_id: corpUser.uid, exp: expires
	    	}, superSecret);

		//send to the dashboard after a successful login
		var SuccessLoginResponse = {
				access_token : token,
				expires_in : expires,
				user_name : corpUser.displayName,
				user_profile_img : 'http://www.finearttips.com/wp-content/uploads/2010/05/avatar.jpg'
		};

		logging.log('[ USERS CONTROLLER ] Authentication successful. Enjoy your token!');
		 logger.info('[ USERS CONTROLLER ] Authentication successful. Enjoy your token!');
		 return res.send(200, { 
	  		success: true,
	  		code: 200, 
	  		message: 'Authentication successful. Enjoy your token!',
	  		data: SuccessLoginResponse
		});

	}else{
		logging.err('[ USERS CONTROLLER ] Authentication not possible. Error: ' + err);
		logger.error('[ USERS CONTROLLER ] Authentication not possible. Error: ' + err);
		return res.send(503, {
			success: false,
			code: 503,
			message: 'Authentication not possible. Error:' + err
		});
	}
}

exports.getIdentity = function(req, res) {
        var decoded = req.decoded;

        console.log('decoded: ', decoded);


    var corpUser = {
                user_name: decoded.user_id,
                display_name: decoded.user_id,
                mail: decoded.user_id + '@Social-Media-NodeJs.com',
                user_profile_img : 'http://www.finearttips.com/wp-content/uploads/2010/05/avatar.jpg'
        };

        res.send(200, {identity: corpUser});
};