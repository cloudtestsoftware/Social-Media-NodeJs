/* This is where routes for all the users requests 
 * are defined
 */

module.exports = function(server) {
	var config   			= require('../config/config_'+global.env).config;
	var namespace           = require('restify-namespace');
	var users               = require('../controllers/controller_users');
	var jwtauth 			= require('../middlewares/jwtauth');

	namespace(server, config.API_url, function () {
		server.get('/auth/login',        jwtauth, users.authenticate);
		server.get('/identity', jwtauth, users.getIdentity);
		server.post('/user/authenticate', users.authenticate);
	});

};


