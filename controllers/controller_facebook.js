/****  Facebook Controller functions here *********/

var facebook_config = require('../config/config_'+global.env).facebook;
var config         = require('../config/config_'+global.env).config;
var request = require('request');
var utils = require ('../utils/utils');
var logger = require('../utils/logger');
var logging = new utils.logging();


// If is the first request of posts (no pagination), we need this format:
// https://graph.facebook.com/v2.3/turbotax/tagged?access_token=00tokencode00|11tokencode11"
function getRequestUrl(pageSlugOrId){
    return facebook_config.base_URL +  pageSlugOrId + '/' + 'tagged' + '?access_token=' + facebook_config.developerKeys.clientId + '|' + facebook_config.developerKeys.clientSecret;
}

//if we received the parameter next_page means that we have to use this URL format:
// "https://graph.facebook.com/v2.3/7511533723/tagged?access_token=00tokencode00|11tokencode11&limit=25&until=1437335163&__paging_token=enc_AdBjuvbC6laPadEB0MTs2eZC28MEnCOiUapJYxejRBQ2kOpew0KWkyrgnAgJTQRxa0OUKZCdVZBcIGvI97Jt9IzscuQ"
// next_page would be in this case = limit=25&until=1437335163&__paging_token=enc_AdBjuvbC6laPadEB0MTs2eZC28MEnCOiUapJYxejRBQ2kOpew0KWkyrgnAgJTQRxa0OUKZCdVZBcIGvI97Jt9IzscuQ
function getPaginationRequestUrl(pageSlugOrId, next_page){
    return getRequestUrl(pageSlugOrId) + '&' +  next_page;
}

// remove (=> "https://graph.facebook.com/v2.3/turbotax/tagged?access_token=00tokencode00|11tokencode11"
// from the url => "https://graph.facebook.com/v2.3/turbotax/tagged?access_token=00tokencode00|11tokencode11&limit=25&until=1437335163&__paging_token=enc_AdBjuvbC6laPadEB0MTs2eZC28MEnCOiUapJYxejRBQ2kOpew0KWkyrgnAgJTQRxa0OUKZCdVZBcIGvI97Jt9IzscuQ"
 // function getNextPageSpecs(paging){
 //    return 'limit=' + paging.split('limit=')[1];
 // }

// paging:  "https://graph.facebook.com/v2.3/7511533723/tagged?since=2011-01-01&access_token=00tokencode00|11tokencode11&limit=25&until=1303186005&__paging_token=enc_AdBO4N4NkeAea6xlqYkE7wRDPZA6SGF8PUMIjSOiSmzwHLbZCntCYn3pJMM70UbCIhtq0leyDZC2ZCZCV9j5WEuVJZCGM5"
// return:  "/7511533723/tagged?since=2011-01-01&access_token=00tokencode00|11tokencode11&limit=25&until=1303186005&__paging_token=enc_AdBO4N4NkeAea6xlqYkE7wRDPZA6SGF8PUMIjSOiSmzwHLbZCntCYn3pJMM70UbCIhtq0leyDZC2ZCZCV9j5WEuVJZCGM5"
function getNextPageSpecs(paging){
    return paging.split('v2.3/')[1];
}


exports.getPublicPostsFromPage = function(req, res, next) {

    req.body = typeof req.body === typeof '' ? JSON.parse(req.body) : req.body;
    
    var query_string
    , pageSlugOrId =  req.body.pageName;

    if(typeof req.body.nextPage !== 'undefined' && req.body.nextPage !== null){
        query_string = getPaginationRequestUrl(pageSlugOrId, req.body.nextPage);
    }else{
        query_string = getRequestUrl(pageSlugOrId);
    }

    //todo: validate that the dates are not undefined or null
    query_string = query_string + utils.getValidDates(req.body.fromDate,req.body.toDate);

    request.get({
        url: query_string,
        proxy: config.proxy
    }, function(err, r, items) {

        if (err) {
            return res.send(400, {
                success: false,
                code: 400,
                message: "" + err
            })
        }        

        items = typeof items === typeof '' ? JSON.parse(items) : items;

        var nextPageInfo = "";


        if(items.hasOwnProperty("paging") && typeof items.paging.next !== null && typeof items.paging.next !== 'undefined'){
            next_results = getNextPageSpecs(items.paging.next);
            // ?max_id=634196357507473407&q=%23TurboTax%20since%3A2015-08-16%20until%3A2015-08-22&include_entities=1
            // next_results = next_results.replace(/%20/g, "&");
            // next_results = next_results.replace(/%3A/g, "=");
            // ?max_id=634196357507473407&q=%23TurboTax&since=2015-08-16&until=2015-08-22&include_entities=1
            nextPageInfo = 'facebook/next?' + next_results;
            logging.log("[ FACEBOOK CONTROLLER ] the next url sent to the dashboard is :" + nextPageInfo);
        }

        if(items.hasOwnProperty("error")) {
            // TODO: handle errors properly - logging
            res.send(200, {code: 200, success:true, data:{}, next_url: null});
        } else {
            var formatedItems = utils.abstractSocialData(items.data, 'facebook');

            res.send(200, {code: 200, success: true, data: formatedItems, next_url: nextPageInfo});
        }

    });
    
};


exports.nextResults = function(req, res, next) {

    function buildQueryFromJson (obj) {
        query = '';
        for (var key in obj) {
            if (query == '')
                query = query + key + '=' + obj[key];
            else
                query = query + '&' + key + '=' + obj[key];
        }
        query = query.replace(/%20/g, "&");
        query = query.replace(/%3A/g, "=");
        return query.replace(/#/g, '%23');
    }

    logging.log('[ FACEBOOK CONTROLLER ] Next Url Received and Processed: ' + buildQueryFromJson(req.query));
    logging.log('[ FACEBOOK CONTROLLER ] Query String: ' + facebook_config.base_URL + buildQueryFromJson(req.query));


    // build facebook query
    var query_string =  facebook_config.base_URL +   buildQueryFromJson(req.query);   


    request.get({
        url: query_string,
        proxy: config.proxy
    }, function(err, r, items) {

        if (err) {
            return res.send(400, {
                success: false,
                code: 400,
                message: "" + err
            })
        }        

        items = typeof items === typeof '' ? JSON.parse(items) : items;

        logging.log('[ FACEBOOK CONTROLLER ] Query string: ' + query_string);


        var nextPageInfo = "";
        if(typeof items.paging !== 'undefined' && typeof items.paging.next !== 'undefined'){

            logging.log('[ FACEBOOK CONTROLLER ] Next page info ' + nextPageInfo);
            next_results = getNextPageSpecs(items.paging.next);
            // ?max_id=634196357507473407&q=%23TurboTax%20since%3A2015-08-16%20until%3A2015-08-22&include_entities=1
            // next_results = next_results.replace(/%20/g, "&");
            // next_results = next_results.replace(/%3A/g, "=");
            // ?max_id=634196357507473407&q=%23TurboTax&since=2015-08-16&until=2015-08-22&include_entities=1
            nextPageInfo = 'facebook/next?' + next_results;
            logging.log("[ FACEBOOK CONTROLLER ] The next result is: " + next_results);
        }

        var formatedItems = utils.abstractSocialData(items.data, 'facebook');

        res.send(200, {code:200, success:true, data:formatedItems, next_url: nextPageInfo});

    });
};





exports.searchPostsByTag = function (req, res, next) {
	var tag = req.params.tag;

	var defaultOptions = {
            type: 'post'
        }
      // TODO: take these options from the client and use some defaults
      // , options =  
      
      , query_string = facebook_config.base_URL +  'search?q=' + tag + '&type=' + defaultOptions.type
      , query_string = query_string + '&access_token=' + facebook_config.developerKeys.clientId + '|' + facebook_config.developerKeys.clientSecret

    request.get({
        url: query_string,
        proxy: config.proxy
    }, function(err, r, items) {
        if (err) {
            return res.send(400, {
                success: false,
                code: 400,
                message: "" + err
            })
        }        

        items = typeof items === typeof '' ? JSON.parse(items) : items;
        
        logging.log('[ FACEBOOK CONTROLLER ] Items: ' + items);

        res.send(200, {code:200, success:true});

    });

}
