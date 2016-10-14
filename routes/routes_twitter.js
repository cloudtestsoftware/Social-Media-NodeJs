/* This is where routes for all the twitter requests 
 * are defined
 */
module.exports = function (server) {
	var config    = require('../config/config_'+global.env).config;
	var twitter = require('../controllers/controller_twitter');
	var namespace = require('restify-namespace'); // To route API calls

	namespace(server, config.API_url, function () {
		server.post('/tweets', twitter.queryTwitter);
		server.get('/tweets/next', twitter.nextResults);
	});
}