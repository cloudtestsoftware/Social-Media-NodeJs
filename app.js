/**
 * Dependencies
 */

// Set global variable env. Check node_env, if not set default to local
var definedEnvironments = ['local','dev','prod'];
global.env = process.env.NODE_ENV;
if (!(definedEnvironments.indexOf(global.env) > -1)) {
   global.env = 'local';
}
console.log(global.env);

var restify       = require('restify');
var utils         = require('./utils/utils');
var fs            = require('fs');
var logger        = require('./utils/logger');
var config        = require('./config/config_'+global.env).config;
var logging       = new utils.logging();
var csp           = require('helmet-csp')

// Set port according to env
var port          = process.env.PORT != undefined ? process.env.PORT : config.port;    

/**
 * Catch all exceptions and log them
 */
process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
});


var options = {

  name: 'Social HTTPS Server',

};

// if(port == 443){
//     options.key =  fs.readFileSync(config.ssl.keyFile);
//     options.certificate =  fs.readFileSync(config.ssl.certFile);
//  // passphrase: config.ssl.passphrase
// }


// console.log(fs.readFileSync(config.ssl.keyFile));

// console.log(fs.readFileSync(config.ssl.certFile));


/**
 * Create the server
 */
var server = module.exports = restify.createServer(
    options
);

/**
 *  Configure server with parsers and plugins
 */
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


/**
 * Content Security Policy middleware.
 * https://www.npmjs.com/package/helmet-csp
 * http://scottksmith.com/blog/2014/09/21/protect-your-node-apps-noggin-with-helmet/
 */
server.use(csp({
  // Specify directives as normal.
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
    // imgSrc: ['img.com', 'data:'],
    // sandbox: ['allow-forms', 'allow-scripts'],
    // reportUri: '/report-violation',

    // objectSrc: [], // An empty array allows nothing through
  },

  // Set to true if you only want browsers to report errors, not block them
  reportOnly: false,

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: false,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true
}));


/**
 *  Sign off opts header with access control headers
 */
server.opts(/.*/, function (req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
  res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));

  res.send(200);
  return next();
}); 

/**
 * RESTIFY AND PASSPORT SESSION MANAGEMENT
 */
/*
// var passport      = require('passport');
// var session       = require('express-session');
// var mongoStore    = require('connect-mongo')(session);

// Configure passport to use Corporate LDAP
// require('./middlewares/ldapauth')(passport); // pass passport for configuration

// Configure restify's session management
// Using mongoStore to store the sessions in the db
 server.use(session({
  name: 'session',
  store: new mongoStore({ mongooseConnection: mongoose.connection }),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // domain: '.app.localhost',
  cookie: { 
    secure: false
  }
}));
server.use(passport.initialize());
server.use(passport.session());
*/

// Adding headers to allow cross domain requests
// reference: http://coderxgamer.com/restify-and-cors-support/
server.pre(restify.CORS({origins: ['*']})); 
server.use(restify.fullResponse());

/**
 * REQUEST LOGGING MIDDLEWARE
 */

// Log all incoming requests
server.pre(function (req, res, next) {
  logger.info('[ REQUEST ] '+'['+req.method+' '+req.url+'] ');
  next();
});


/**
 *  Start the server
 */
server.listen(port);
logging.log("server listening on port " + port + '. Environment: ' + global.env);


/**
 * Export server
 */
// module.exports.server = server;

/*
 *  Link routes here
 */
require('./routes/routes_users')      (server);
require('./routes/routes_twitter')    (server);
require('./routes/routes_instagram')  (server);
require('./routes/routes_facebook')   (server);
