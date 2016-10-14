//********************************************************************//
//*****************This is where we add utility stuff*****************// 
//********************************************************************//


var stringConstructor = "test".constructor;
var arrayConstructor = [].constructor;
var objectConstructor = {}.constructor;
var hmac_sha256 = require('crypto-js/hmac-sha256');
var CryptoJS = require('crypto-js');
var moment = require('moment');
var sanitizer = require('sanitizer');

function logging(){
	this.enable=false;
	this.req ;
}

logging.prototype.log = function(content){
	if (typeof content == typeof "" ){
		this.req!==undefined?console.log('[ LOG ] '+'['+this.req.method+' '+this.req.url+'] '+content) : 
		console.log('[ LOG ] '+content);
	}
	else {
		this.req!==undefined?console.log('[ LOG ] '+'['+this.req.method+' '+this.req.url+'] ') : 
		console.log('[ LOG ] ');
		console.log(content);
	}
};

logging.prototype.err = function(content){
	if (typeof content == typeof "" ){
		this.req!==undefined?console.log('[ ERROR ] '+'['+this.req.method+' '+this.req.url+'] '+content) : 
		console.log('[ ERROR ] '+content);
	}
	else {
		this.req!==undefined?console.log('[ ERROR ] '+'['+this.req.method+' '+this.req.url+'] ') : 
		console.log('[ ERROR ] ');
		console.log(content);
	}
};	

//Send status and Json response
exports.sendResponse = function (status, message, res) {
    console.log(message);
    res.send(status,message);
}


exports.getEpochTime= function (currentDate){
	return currentDate.getTime()/1000.0
}


exports.addToJSON = function(collection,key,value){
	if(collection.constructor === arrayConstructor) {
		for(var i=0;i<collection.length;i++){
		            collection[i][key] = value;
		}
		return collection;
	}
	else if (collection.constructor === objectConstructor){
		collection[key] = value;
	} 
	else return collection;
}

// to find index of an item in the array
// Source: http://stackoverflow.com/questions/1181575/javascript-determine-whether-an-array-contains-a-value
exports.indexOf = function(needle) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle);
};

exports.getSignature = function(urlToHash,Secret) { 
	return CryptoJS.enc.Base64.stringify(
 		CryptoJS.HmacSHA256(
  		urlToHash, // url to hash
  		Secret // your api secret
 		)
	);
}

exports.abstractSocialData = function(dataArray, source) {
	var data = [];
	var dateFormat = 'MMM Do, YYYY';
	var timeFormat = 'hh:mmA';

	if (source === 'twitter') {
		for (var i=0, len=dataArray.length; i<len; i++) {
			console.log(i);
			var temp            = {};
			var obj             = dataArray[i];
			var postDate 		= new Date(Date.parse(obj.created_at));
			temp.id             = obj.id_str;
			temp.data_source    = source;
			// temp.peer           = obj.location;
			temp.peer           = null;
			temp.comment        = obj.text;
			temp.name           = obj.user.name;
			temp.screen_name    = obj.user.screen_name;
			temp.profile_img    = obj.user.profile_image_url;
			temp.profile_img 	= temp.profile_img.replace('_normal','');
			// temp.date           = obj.created_at;
			temp.date           = moment(postDate).format(dateFormat);
			temp.date_raw		= postDate;
			// temp.time           = obj.created_at;
			temp.time           = moment(postDate).format(timeFormat);
			temp.favorite_count = obj.favorite_count;
			temp.share_count    = obj.retweet_count;
			temp.comment_count  = obj.retweet_count;
			temp.url            = 'https://twitter.com/' + temp.name + '/status/' + temp.id;
			
			try {
				temp.img        = obj.entities.media[0].media_url;
				// temp.img        = obj.entities.media[0].media_url + ':thumb';
				temp.thumbnail  = obj.entities.media[0].media_url + ':thumb';
			} catch(e) {
				temp.img        = null;
				temp.thumbnail  = null;
			}

			data.push(temp);
		};
		return data;
	}
	else if (source === 'instagram') {
		for (var i=0, len=dataArray.length; i<len; i++) {
			var temp            = {};
			var obj             = dataArray[i];
			var postDate        = new Date(parseInt(obj.created_time) * 1000);
			temp.id             = obj.id;
			temp.data_source    = source;
			temp.peer           = obj.location
			temp.comment        = obj.caption.text;
			temp.name           = obj.user.full_name;
			temp.screen_name    = obj.user.username;
			// temp.date           = obj.created_time;
			temp.date           = moment(postDate).format(dateFormat);
			temp.date_raw		= postDate;
			// temp.time           = obj.created_time;
			temp.time           = moment(postDate).format(timeFormat);
			temp.favorite_count = obj.likes.count;
			temp.share_count    = obj.retweet_count;
			temp.comment_count  = obj.comments.count;
			temp.url            = obj.link;
			
			try {
				temp.profile_img = obj.user.profile_picture;
			} catch(e) {
				temp.profile_img = null;
			}

			try {
				temp.img        = obj.images.standard_resolution.url;
				temp.thumbnail  = obj.images.thumbnail.url;
			} catch(e) {
				temp.img        = null;
				temp.thumbnail  = null;
			}
			
			data.push(temp);
		};
		return data;
	}
	else if (source === 'facebook') {
		for (var i=0, len=dataArray.length; i<len; i++) {
			var temp            = {};
			var obj             = dataArray[i];
			var id 				= obj.id.split("_");
			var postDate       	= new Date(obj.created_time);
			temp.id 			= id[1];
			temp.user			= obj.from;
			temp.data_source    = source;
			temp.comment        = obj.message;
			temp.name           = obj.from.name;
			temp.screen_name    = obj.from.name;
			// temp.date           = obj.created_time;
			temp.date           = moment(postDate).format(dateFormat);
			temp.date_raw		= postDate;
			// temp.time           = obj.created_time;
			temp.time           = moment(postDate).format(timeFormat);
			temp.profile_img    = "https://graph.facebook.com/"+obj.from.id+"/picture?type=large";
			temp.url            = "https://www.facebook.com/" + id[0] + "/posts/" + id[1];
			
			try {
				temp.peer = obj.location.name
			}
			catch(e) {
				temp.peer = null
			}	

			try {
				temp.img        = obj.picture;
				temp.thumbnail  = obj.picture;
			} catch(e) {
				temp.img        = null;
				temp.thumbnail  = null;
			}
			
			try {
				temp.favorite_count = obj.likes.data.length;
			} catch(e) {
				temp.favorite_count = 0
			}

			try {
				temp.comment_count = obj.comments.data.length;
			} catch(e) {
				temp.comment_count = 0;
			}

			try {
				temp.share_count = obj.shares.count;
			} catch(e) {
				temp.share_count = 0;
			}

			data.push(temp);
		};
		return data;
	}
	else {
		// throw error ?
		return [];
	};
}




// used in the facebook, houseparty, instagram and twitter controllers to filter the date range.
exports.getValidDates = function (fromDate, toDate){
    var dateFormat = 'YYYY-MM-DD';
    var since = "";
    var until = "";
    var fromDate = moment(fromDate).format(dateFormat);
    var toDate = moment(toDate).format(dateFormat);
    var currentDate = moment();
    //Simple... (fromDate has to be < toDate and toDate has to be before today or max. today.
    if(fromDate <= toDate && toDate <= currentDate.format(dateFormat)){
        //Now - toDate has to be > 6 (Twitter v1.1 API doesn't allow 'until' to be older than 1 week (7 days) from now) 
        // if(currentDate.diff(toDate,'days') <= 7){ 
            until = '&until=' + toDate;
        // }
            since = '&since=' + fromDate;
    }
    //filtered and formated date.
    return  since + until;
}


//E.g. pid = username + project given name. wid = username + widget given name. (One user cannot create two projects with the same name)
exports.makeid  = function()
{
 	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//the old way to crate the ids was this one:
//E.g. pid = username + project given name. wid = username + widget given name. (One user cannot create two projects with the same name)
// exports.makeid  = function (username, word)
// {
// 	var length = 20;
// 	var string = username + word;
// 	string = string.replace(/\s+/g, '_'); //replacing space with _ (userfriendly)
// 	var trimmedString = string.substring(0, length);
//     return trimmedString;
// }



// Filtering out random characters included by the users in their posts (fb, hp, twitter, etc.)
// http://stackoverflow.com/questions/5191062/what-is-the-equivalent-javascript-code-for-phps-mysql-real-escape-string
exports.mysqlEscape = function(stringToEscape){
	console.log('escaping');
    if(stringToEscape == '') {
        return stringToEscape;
    }
    return stringToEscape
        .replace(/\\/g, "\\\\")
        .replace(/\'/g, "\\\'")
        .replace(/\"/g, "\\\"")
        .replace(/\?/g, "\\\&#63") //note that "\\\?" doesn't work.
        .replace(/\n/g, "\\\n")
        .replace(/\r/g, "\\\r")
        .replace(/\x00/g, "\\\x00")
        .replace(/\x1a/g, "\\\x1a");
}

//putting back the special characters before retrieving it to the Dashboard
exports.mysqlUnEscape = function(stringToEscape){
	console.log('escaping');
    if(stringToEscape == '' || stringToEscape == undefined) {
        return stringToEscape;
    }
    return stringToEscape
        .replace(/\&#63/g, "?") //so far this is the only character encoded in a weird way
        .replace(/\'/g, "'") //so far this is the only character encoded in a weird way
}



//wrapper for the html sanitizer
function wrapSanitizer(userInputString) {
	//Note:
	//sanitizer.sanitize('your dirty string'); // Strips unsafe tags and attributes from html.
	//sanitizer.escape('your dirty string'); // Escapes HTML special characters in attribute values as HTML entities
	return sanitizer.escape(sanitizer.sanitize(userInputString));
}

// Exports here

// module.exports.passwordHash = require('password-hash'); // Hashing passwords
module.exports.randtoken = require('rand-token');  // Generate Tokens
module.exports.logging = logging;
module.exports.sanitize = wrapSanitizer;

