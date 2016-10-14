'use strict';

//http://patorjk.com/software/taag/#p=display&f=Doom&t=social%20network%20api%20config
//       _                            _                        __ _       
//      | |                          | |                      / _(_)      
//   ___| |__   __ _ _ __  _ __   ___| |___    ___ ___  _ __ | |_ _  __ _ 
//  / __| '_ \ / _` | '_ \| '_ \ / _ \ / __|  / __/ _ \| '_ \|  _| |/ _` |
// | (__| | | | (_| | | | | | | |  __/ \__ \ | (_| (_) | | | | | | | (_| |
//  \___|_| |_|\__,_|_| |_|_| |_|\___|_|___/  \___\___/|_| |_|_| |_|\__, |
//                                                                   __/ |
//                                                                  |___/ 

exports.twitter = {
	data_source : "twitter",
	developerKeys : { 
		consumerKey : '', 
		consumerSecret : '',
		accessToken : '',
		accessTokenSecret : ''
 	},
	base_URL : 'https://api.twitter.com/1.1/'
};

exports.instagram = {
	data_source : "instagram",
	developerKeys : { 
		clientId : '',
		clientSecret: '',
		accessToken : ''
 	},
	base_URL : 'https://api.instagram.com/v1/'
};

exports.facebook = {
	data_source : "facebook",
	developerKeys : {
		clientId: '',
		clientSecret: ''
		// accessToken : clientId + clientSecret
 	},
	base_URL : 'https://graph.facebook.com/v2.3/'
};

//  _        _                                                    __ _       
// | |      | |                                                  / _(_)      
// | |_ ___ | | _____ _ __     __ _  ___ _ __     ___ ___  _ __ | |_ _  __ _ 
// | __/ _ \| |/ / _ \ '_ \   / _` |/ _ \ '_ \   / __/ _ \| '_ \|  _| |/ _` |
// | || (_) |   <  __/ | | | | (_| |  __/ | | | | (_| (_) | | | | | | | (_| |
//  \__\___/|_|\_\___|_| |_|  \__, |\___|_| |_|  \___\___/|_| |_|_| |_|\__, |
//                             __/ |                                    __/ |
//                            |___/                                    |___/ 

exports.users = {
	JWTSecret : '', 
	JWTexpiry : {
		value : 30,
		type: 'days' 
	}
};

                                      // __ _         _ 
//                                      / _(_)       | |
//   __ _ _ __  _ __     ___ ___  _ __ | |_ _  __ _  | |
//  / _` | '_ \| '_ \   / __/ _ \| '_ \|  _| |/ _` | | |
// | (_| | |_) | |_) | | (_| (_) | | | | | | | (_| | |_|
//  \__,_| .__/| .__/   \___\___/|_| |_|_| |_|\__, | (_)
//       | |   | |                             __/ |    
//       |_|   |_|                            |___/     


exports.config = {
	port: 8013,
    API_url:'/api/v1.1',
};