/**
 * jwtauth
 *
 *  A simple middleware for parsing a JWt token attached to the request. If the token is valid, the corresponding user
 *  will be attached to the request.
 */

var url = require('url')
var jwt = require('jwt-simple');
var utils = require('../utils/utils');
var users_config = require('../config/config_'+global.env).users;
var secret = users_config.JWTSecret;
var logger = require('../utils/logger');
// var logging = new utils.logging();

module.exports = function(req, res, next){

	// Parse the URL, we might need this
	var parsed_url = url.parse(req.url, true)

	/**
	 * Take the token from:
	 * 
	 *  - the POST value access_token
	 *  - the GET parameter access_token
	 *  - the x-access-token header
	 *    ...in that order.
	 */
	var token = (req.body && req.body.access_token) || parsed_url.query.access_token || req.headers["x-access-token"];

	if (token) {
		try {
			logger.info('Decoding token.');

			var decoded = jwt.decode(token, secret)

			// check if token has expired.
			if (decoded.exp <= Date.now()) {
				logger.info('Token has expired.');

				return res.json({
					success: false,
					code: 401,
					message: 'Authentication Failed. Access token has expired.'
				});
			}

			else {

				logger.info('Token valid.');
				req.decoded = decoded;
				next();
			}
		}
		catch (err) {

			logger.info('Failed to authenticate token: ' + err);

			return res.json({ 
				success: false,
				code: 401, 
				message: 'Failed to authenticate token: ' + err
	        });
		}
	}
	// no token found
	else {
		
		logger.info('Access token not provided.');

		return res.json({ 
			success: false,
			code: 403, 
			message: 'No token provided.' 
		});
	}
}
