/* This is where routes for all the facebook requests 
 * are defined
 */

module.exports = function (server) {
	var config    = require('../config/config_'+global.env).config;
	var facebook = require('../controllers/controller_facebook');
	var namespace = require('restify-namespace'); // To route API calls

	namespace(server, config.API_url, function () {
		server.post('/facebook/page', facebook.getPublicPostsFromPage);
		server.get('/facebook/next', facebook.nextResults);
	});
}