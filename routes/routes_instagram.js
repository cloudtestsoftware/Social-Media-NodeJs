/* This is where routes for all the instagram requests 
 * are defined
 */
module.exports = function (server) {
	var config    = require('../config/config_'+global.env).config;
	var instagram = require('../controllers/controller_instagram');
	var namespace = require('restify-namespace'); // To route API calls

	// server = module.parent.exports.server;

	namespace(server, config.API_url , function () {	
		server.get('/instagram/:tag', instagram.queryInstagram);
	});
}