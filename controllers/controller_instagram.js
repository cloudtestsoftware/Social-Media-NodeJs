var instagram_config = require('../config/config_'+global.env).instagram;
var config         = require('../config/config_'+global.env).config;
var request          = require('request');
var utils            = require ('../utils/utils');
var sanitize         = require('../utils/utils').sanitize; // For removing scripts from user input.
var logger           = require ('../utils/logger');
var logging          = new utils.logging();


// Sample query = search for images with a #tag 
// https://api.instagram.com/v1/tags/SEARCH-TAG/media/recent?client_id=CLIENT-ID&callback=YOUR-CALLBACK
// API documentation: http://instagram.com/developer/api-console/
exports.queryInstagram = function (req, res, next) {

    //construct query for instagram
    var query_string = instagram_config.base_URL + 'tags/' + req.params.tag + "/media/recent?access_token=" + instagram_config.developerKeys.accessToken ;

    if (req.params.max !== undefined) {
        query_string = query_string + '&max_tag_id=' + req.params.max;
    }

    request.get({
        url: query_string,
        // oauth: oauth,
        json: true,
        proxy: config.proxy
    }, function(e, r, items) {

        if (e) {
            logging.err('[ INSTAGRAM CONTROLLER ] Could not search instagram. Error: ' + e);
            logger.error('[ INSTAGRAM CONTROLLER ] Could not search instagram. Error: ' + e);
            res.send(500, {
                success: false,
                code: 500,
                message: 'Could not search instagram. ' + e
            })
        }
        
        logging.log("[ INSTAGRAM CONTROLLER ] Query string:" + query_string);
        // logging.log(items);
        logging.log('[ INSTAGRAM CONTROLLER ] Status code: ' + res.statusCode);

        items = typeof items === typeof '' ? JSON.parse(items) : items;
        next_results = items.pagination.next_max_tag_id;
        items = utils.abstractSocialData( items.data, 'instagram' ); 

        var return_obj = {
            code: 200,
            success: true,
            message: 'Instgram search successful.',
            data: items
        };

        
        if (typeof next_results !== 'undefined' && next_results !== null) {
            // remove '/api/v1.0/' from the url => .split('/api/v1.0/').pop()
            // also remove ?max=num if present => .split('?max=')[0]
            // and then append the ?max=(new_pagination_index) => '?max=' + next_results
            var next_url = req.url.split('/api/v1.2/').pop().split('?max=')[0] + '?max=' + next_results;
            return_obj.next_url = sanitize(next_url);
        }

        //send the items back
        res.send(200, return_obj);
    });

    return next();
}