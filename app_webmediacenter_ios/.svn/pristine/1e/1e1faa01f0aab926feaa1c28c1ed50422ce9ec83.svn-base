var hmacApp = angular.module('hmac', [], function ($httpProvider) {
	var secret = "3cqjE29eGpMNMg4hwANBHZkC";
	var publicK = "q2wDNUfpjtYB";
    // Add an HTTP interceptor which passes the request URL to the transformer
    // Allows to include the URL into the signature
    // Rejects request if no hmacSecret is available
    $httpProvider.interceptors.push(function($q) {
       return {
            'request': function(config) {
                config.headers['METHOD'] = config.method;
                if(config.hmac !== undefined && config.hmac){
                	config.headers['HMAC'] = true;
                }
                if(config.method == 'JSONP'){
                	config.timeout = 5000;
                }                
                return config || $q.when(config);
            }
       };
    });

    // Add a custom request transformer to generate required headers
    $httpProvider.defaults.transformRequest.push(function(data, headersGetter) {
    	if(!data) data = '""';

    	if(headersGetter()['HMAC'] !== undefined){
    		// Finally generate HMAC and set header
    		headersGetter()['authentication'] = 'HMAC '+publicK+":"+CryptoJS.HmacSHA256(headersGetter()['METHOD'] + ' ' + data, secret).toString(CryptoJS.enc.Hex);    		
    		
    		delete headersGetter()['METHOD'];
    		delete headersGetter()['HMAC'];    		   		
        }
        return data;
    });
});