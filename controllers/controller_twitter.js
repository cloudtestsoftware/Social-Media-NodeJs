/****  Twitter Controller functions here *********/

var twitter_config = require('../config/config_'+global.env).twitter;
var config         = require('../config/config_'+global.env).config;
var request        = require('request');
var utils          = require ('../utils/utils');
var logger         = require('../utils/logger');
var logging        = new utils.logging();


/****  Imports for SA *********/

var parseString = require('xml2js').parseString;
var http        = require('http');
var async       = require('async');
var request     = require('request');
var unirest     = require('unirest');
var overallPolarity;


// Construct Oauth Object
var oauth = {
    consumer_key:    twitter_config.developerKeys.consumerKey,
    consumer_secret: twitter_config.developerKeys.consumerSecret,
    token:           twitter_config.developerKeys.accessToken,
    token_secret:    twitter_config.developerKeys.accessTokenSecret
};

// query builder for twitter
function twitterQueryBuilder (filters) {
    /* filters
    {
        and : [],
        or : [],
        not : [],
        hashtags : [],
        fromDate : '',    // moment().format()
        toDate : ''       // moment().format()
    }
    */

    var enforceLeadingHashtag = function (hashtag) {
        return hashtag[0] === '#' ? hashtag : '#' + hashtag;
    };

    var joinAnds = function (and) {
        return and.join(' ');
    };

    var joinOrs = function (or) {
        return or.join(' OR ');
    };

    var joinNots = function (not) {
        return '-' + not.join(' -');
    };

    var joinHashtags = function (hashtags) {
        return hashtags.map(enforceLeadingHashtag).join(' OR ');
    };

    var joinDates = function (fromDate, toDate) {
          return utils.getValidDates(fromDate,toDate);
    };
    

    var query = '';

    query += filters.and && filters.and.length ?
        joinAnds(filters.and) : '';
    query += filters.or && filters.or.length ?
        ' ' + joinOrs(filters.or) : '';
    query += filters.not && filters.not.length ?
        ' ' + joinNots(filters.not) : '';
    query += filters.hashtags && filters.hashtags.length ?
        ' ' + joinHashtags(filters.hashtags) : '';

    // remove leading and trailing spaces
    query = query.replace(/^\s+/, '').replace(/\s+$/, '');

    // logging.log("1");
    // adding date range specifier causes auth problems.. ?
    query = encodeURIComponent(query) + joinDates(filters.fromDate, filters.toDate); // we don't want to encode '&' but we want to encode '#'
    // logging.log("2");

 
    logging.log('[ TWITTER CONTROLLER ] Query: ' + query);

    return query;
    // return encodeURIComponent(query);
};




// Sample query = search search for tweets referencing @twitterapi account ->  https://api.twitter.com/1.1/search/tweets.json?q=%40twitterapi 
// Cheat Sheet : https://dev.twitter.com/docs/using-search

exports.queryTwitter = function(req, res, next) {

    req.body = typeof req.body === typeof '' ? JSON.parse(req.body) : req.body;

    var filters = {}
      , filter_query = '';

    if (typeof req.body.hashtags !== undefined) {
        filters.hashtags = req.body.hashtags;
    }

    if (typeof req.body.and !== undefined) {
        filters.and = req.body.and;
    }

    if (typeof req.body.or !== undefined) {
        filters.or = req.body.or;
    }

    if (typeof req.body.not !== undefined) {
        filters.not = req.body.not;
    }

    if (typeof req.body.fromDate !== undefined) {
        filters.fromDate = req.body.fromDate;
    }

    if (typeof req.body.toDate !== undefined) {
        filters.toDate = req.body.toDate;
    }

    try {
        filter_query = twitterQueryBuilder(filters);
    }
    catch (err) {
        return res.send(400, {
            success: false,
            message: 'Invalid filters provided for twitter query. ' + err
        })
    }

    //construct query for twitter
    // var query_string = twitter_config.base_URL + 'search/tweets.json?q=' + req.params.parameters.replace(/#/g, '%23');
    var query_string = twitter_config.base_URL + 'search/tweets.json?q=' + filter_query;

    request.get({
        url: query_string,
        oauth: oauth,
        json: true,
        // proxy: config.proxy
    }, function(e, r, tweets) {
        if (e) {
            res.send(500, {
                code:500,
                message: 'Query unsuccessful. ' + e
            });
        }
        logging.log("[ TWITTER CONTROLLER ] Query: " + query_string);
        logging.log('[ TWITTER CONTROLLER ] Status code: ' + res.statusCode);
        // logging.log(tweets.statuses);
     
        var return_obj;


    async.series([
        function(callback){

                async.series([
                    function(callback){
                        startProcessing(utils.abstractSocialData( tweets.statuses, 'twitter' ), callback);
                    },
                    function(callback){

                        return_obj = {
                            code:200,
                            message: 'Query successful'
                        };
                        callback(null, 'two');
                    }
                ],
                // optional callback
                function(err, results){
                   var result = results[0]; //this is the result from 'startProcessing'
                   return_obj.overallPolarity = overallPolarity / result.length;
                   return_obj.numberOfTweetsAnalyzed = result.length;
                   return_obj.data = result; 
                   callback(null, 'one');
                });

       },
            function(callback){

                 if(tweets.search_metadata.next_results != null && tweets.search_metadata.next_results != 'undefined'){
                        next_results = tweets.search_metadata.next_results;
                        // ?max_id=634196357507473407&q=%23TurboTax%20since%3A2015-08-16%20until%3A2015-08-22&include_entities=1
                        next_results = next_results.replace(/%20/g, "&");
                        next_results = next_results.replace(/%3A/g, "=");
                        // ?max_id=634196357507473407&q=%23TurboTax&since=2015-08-16&until=2015-08-22&include_entities=1
                        return_obj.next_url = 'tweets/next' + next_results;
                    }

                callback(null, 'two');
            },

            function(callback){
                //send the tweets back
                res.send(200, return_obj);
                callback(null, 'three');
            },
        ],
        function(err, results){

        return next();
            // results is now equal to ['one', 'two']
        });
    });
};




function makeNlpRequest(tweet, nlpUrl, nlpKey, callback){

    unirest.post(nlpUrl)
    .header("X-Mashape-Key", nlpKey)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Accept", "application/json")
    .header("RejectUnauthorized", false)
    .send("language=english")
    .send("text=" + tweet.comment)
    .end(function (result) {
        var tweetPolarityValue = result.body.probability.pos;
        overallPolarity = overallPolarity + tweetPolarityValue; //this will be later on divided by count(tweets)


        tweet.polarityValue = tweetPolarityValue;
        tweet.polarity = tweetPolarityValue > 0.6 ? 'positive' : (tweetPolarityValue < 0.4 ? 'negative' : 'neutral');
        // wordsPositivePolarity.push(result.body.probability.pos);
        // wordsNegativePolarity.push(result.body.probability.neg);

        callback();
    });
}




function startProcessing(tweets, callbackFromAsyncSerie){

    var nlpUrl  = 'https://japerk-text-processing.p.mashape.com/sentiment/';
    var nlpKey =  '1V6k5vCYwRmshDi6ekK7cJHFJFJOp1arJGSjsnurTjpH1dQfSp';

    if(tweets.length === 0){
        console.log("ERROR: Please pass in an input string.");
    }
    else{
        async.eachSeries(tweets, 
            function makeThesaurusRequest(tweet, callback){
                makeNlpRequest(tweet, nlpUrl, nlpKey, callback);
            },
            function(err){
                if(err){
                    throw err;
                }
                callbackFromAsyncSerie(null, tweets);
            }
        );
    }
}


exports.nextResults = function (req, res, next) {
    
    function buildQueryFromJson (obj) {
        query = '?'
        for (var key in obj) {
            if (query == '?')
                query = query + key + '=' + obj[key];
            else
                query = query + '&' + key + '=' + obj[key];
        }
        query = query.replace(/%20/g, "&");
        query = query.replace(/%3A/g, "=");
        return query.replace(/#/g, '%23');
    }
    // logging.log(req);

    logging.log('[ TWITTER CONTROLLER ] NEXT URL: ' + buildQueryFromJson(req.query));


    // build twitter query
    var query_string = twitter_config.base_URL + 'search/tweets.json' + buildQueryFromJson(req.query);   

    request.get({
        url: query_string,
        oauth: oauth,
        json: true,
        // proxy: config.proxy
    }, function(e, r, tweets) {
        if (e) {
            res.send(500, {
                code:500,
                message: 'Query unsuccessful. ' + e
            });
        }
        logging.log("[ TWITTER CONTROLLER ] Query: " + query_string);
        // logging.log(tweets);

        logging.log('[ TWITTER CONTROLLER ] Status code: ' + res.statusCode);

        var return_obj = {
            code:200,
            message: 'Query successful',
            data: utils.abstractSocialData( tweets.statuses, 'twitter' )
        };


        if(tweets.search_metadata.next_results != null && tweets.search_metadata.next_results != 'undefined'){
            next_results = tweets.search_metadata.next_results;
            // ?max_id=634196357507473407&q=%23TurboTax%20since%3A2015-08-16%20until%3A2015-08-22&include_entities=1
            next_results = next_results.replace(/%20/g, "&");
            next_results = next_results.replace(/%3A/g, "=");
            // ?max_id=634196357507473407&q=%23TurboTax&since=2015-08-16&until=2015-08-22&include_entities=1
            return_obj.next_url = 'tweets/next' + next_results;
            logging.log("[ TWITTER CONTROLLER ] The next result is: " + next_results);
        }


        //send the tweets back
        res.send(200, return_obj);

    });

    return next();
}


