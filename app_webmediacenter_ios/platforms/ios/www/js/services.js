angular.module('starter.services', [])

.constant(
    'ApiConfig', {
        wsKey : window.localStorage['restPass'] !== undefined ? window.localStorage['restPass'] : 'mypassword',
        ovpEndpoint : 'http://api.overplace.com/rest/application/',
        ovpEndpointHmac : 'http://api.overplace.com/rest/v1/'
    }
)

.constant(
	'APP_VERSION', 2
)

.constant(
    'Cache', {
        convalideCache : [],
        convalideCacheAll : [],
        convalideCacheId : {},
        convalideRemovedCache : [],
        notificheCache : [],
        notificheCacheId : {},
        notificheCacheRead : {}
    }
)

.factory('NavBadges', function($http){

    var Nav = {};

    Nav.badges = {'notifiche': 0, 'convalide': 0, 'chat': 0};

    Nav.setBadges = function(key, val){
        Nav.badges[key] = window.localStorage['nr_'+key] = val;
    }

    Nav.getBadges = function(){
        return Nav.badges;
    };

    return Nav;

})

.factory('Auth', function($http, $q, $cordovaFileTransfer, $cordovaFile, ApiConfig, PushState, Chats, Cache, APP_VERSION){

    var _this = this,
    	user_data = window.localStorage.getItem('user') !== null ? JSON.parse(window.localStorage['user']) : {};
    
    this.clearLocalStorage = function(){
        window.localStorage.clear();
    }
    
    return {

    	clearStorage : function(){
    		_this.clearLocalStorage();
    		return true;
    	},
        login: function(_username, _password){

            var deferred = $q.defer();
            var urlApiHmac = ApiConfig.ovpEndpointHmac+'login';
            var param = {
        		username: _username, 
        		password: _password,
        		app_type: 'WebMediaCenter'
        	};
            
            param['nocache'] = new Date().getTime();

            return $http({
		                method: 'POST',
		                url: urlApiHmac,
		                data: JSON.stringify(param).replace(/\//g,'\\/'),
		                cache: false,
		                hmac: true
		            })
		            .success(function(data, status, headers, config){
		            			            	
		                var url = data.filename;
		                var filename = url.split("/").pop();
		                var targetPath = cordova.file.dataDirectory + filename;
		                var trustHosts = true;
		                var options = {};
		                data.filepath = targetPath;
		                $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
		                    .then(function(result) {
		                    	
		                        PushState.register(data)
		                            .then(function(response){
		                            	return deferred.resolve(data);
		                            }, function(error){
		                            	return deferred.reject();
		                            });
		
		                    }, function(error) {
		                        return deferred.reject();
		                    });
		
		            })
		            .error(function(data, status){
		                return deferred.reject();
		            });
        },

        logout: function(){

            var deferred = $q.defer();

            return PushState.unregister()
                    .then(function(response){

                        _this.clearLocalStorage();

                        Chats.unsubscribeChannels();
                        Cache.convalideCache = [];
                        Cache.convalideCacheAll = [];
                        Cache.convalideCacheId = {};
                        Cache.convalideRemovedCache = [];
                        Cache.notificheCache = [];
                        Cache.notificheCacheId = {};
                        Cache.notificheCacheRead = {};
                        Cache.newsCache = [];
                        Cache.newsCacheId = {};

                        return deferred.resolve(response);
                    }, function(error){
                        return deferred.reject();
                    });

        },

        storeAuthInfo: function(data){
        	window.localStorage['APP_VERSION'] = APP_VERSION;
            window.localStorage['id_scheda'] = data.id_scheda;
            window.localStorage['user'] = JSON.stringify(data);
            window.localStorage['enablePushNotifications'] = true;
            window.localStorage['showModuliInattivi'] = true;
            if(data.wmc_data.chat == '1'){
            	window.localStorage['chatAvailable'] = true;
            } else {
            	window.localStorage['chatAvailable'] = false;
            }
            
            user_data = data;
        },
        
        checkStatus : function(id_scheda){

            var deferred = $q.defer();

            var param = {
            	app_type: 'WebMediaCenter',
            	username: this.getUserData('nome_utente')
            };
            param[ApiConfig.wsKey] = 'JSON_CALLBACK';
            param['nocache'] = new Date().getTime();

        	$http({
                    method: 'JSONP',
                    url: ApiConfig.ovpEndpoint+'permessi-app/'+id_scheda,
                    params: param,
                    cache: false
                })
                .success(function(res, status, headers, config){
                	
                	if(res.support.filename !== undefined && res.support.filename != ''){
                		                		
                		var url = res.support.filename;
                		var filename = url.split("/").pop();
                		var targetPath = cordova.file.dataDirectory + filename;
                		var trustHosts = true;
                		var options = {};
                		
                		res.support.filepath = targetPath;
                		
                		$cordovaFileTransfer.download(url, targetPath, options, trustHosts);
                	}else{
                		res.support.filepath = user_data.support.filepath;
                	}
                	
                	if(user_data.filename != res.filename){
                		
                		var url = res.filename;
                		var filename = url.split("/").pop();
                		var targetPath = cordova.file.dataDirectory + filename;
                		var trustHosts = true;
                		var options = {};
                		            		
                		res.filepath = targetPath;
                		
                		$cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                		.then(function(result) {
                			deferred.resolve(res);                			
                		}, function(error) {
                			deferred.reject();
                		});
                	}else{
                		res.filepath = user_data.filepath;
                		deferred.resolve(res);
                	}
                })
                .error(function(res, status){
                    deferred.reject();
                });
            return deferred.promise;
        },
        
        changeAppVersion : function(id_scheda, app_version) {
        	var deferred = $q.defer();
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'post/change-app-version/'+id_scheda;
        	var param = {
        		version: app_version
        	};
        	
        	$http({
                method: 'POST',
                url: urlApiHmac,
                data: JSON.stringify(param).replace(/\//g,'\\/'),
                cache: false,
                hmac: true
            })
            .success(function(data, status, headers, config){
            	if(data.hasOwnProperty('error') != false){
            		deferred.reject();
            	}else{
            		deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	
        	return deferred.promise;
        },
        
        clearCache : function(){
        	 Chats.unsubscribeChannels();
             Cache.convalideCache = [];
             Cache.convalideCacheAll = [];
             Cache.convalideCacheId = {};
             Cache.convalideRemovedCache = [];
             Cache.notificheCache = [];
             Cache.notificheCacheId = {};
             Cache.notificheCacheRead = {};
             Cache.newsCache = [];
             Cache.newsCacheId = {};
             return true;
        },
                
        getUserData: function(key){
        	        	
        	if(key != null){
        		if(user_data.hasOwnProperty(key)){
        			return user_data[key];
        		}else{
        			return {};
        		}
        	}else{
        		return user_data;
        	}
        	
        }

    }

})

.factory('PushState', function($http, $q, $cordovaPush, $cordovaDevice, ApiConfig){

    var _this = this;

    var config = null;
    var regId = null;
    var id_scheda = null;
    var reference = null;

    if(ionic.Platform.isAndroid()){
        config = {'senderID':'4010075130'};
    }else if(ionic.Platform.isIOS()){
        config = {'badge':'true','sound':'true','alert':'true'};
    }

    this.storeDeviceToken = function(operation){

        id_scheda = window.localStorage['id_scheda'];
        regId = window.localStorage['regId'];

        var deferred = $q.defer();

        var param = {
        	regid: regId,
        	uuid: $cordovaDevice.getUUID(),
        	so_type: $cordovaDevice.getPlatform(),
        	app_type: 'WebMediaCenter'
        };

        param[ApiConfig.wsKey] = 'JSON_CALLBACK';
        param['nocache'] = new Date().getTime();
        return $http({
                    method: 'JSONP',
                    url: ApiConfig.ovpEndpoint+'reg/'+id_scheda+'/'+operation+'/fields',
                    params: param,
                    cache: false
                })
                .success(function(data, status, headers, config){
                    return deferred.resolve(data);
                })
                .error(function(response, status, headers, config){
                    return deferred.reject();
                });

    };

    return {

        register: function(data){

            var deferred = $q.defer();

            id_scheda = data.id_scheda;

            return $cordovaPush.register(config)
                    .then(function(result){
                        // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
                        if(ionic.Platform.isIOS()){
                            regId = result;
                            window.localStorage['regId'] = regId;
                            _this.storeDeviceToken('registration');
                        }
                        return deferred.resolve(result);
                    },function(err){
                        return deferred.reject();
                    });

        },

        unregister: function(){

            var deferred = $q.defer();

            return _this.storeDeviceToken('unregistration')
                      .then(function(response){
                          return deferred.resolve(response);
                      }, function(error){
                          return deferred.reject();
                      });

        },

        handleAndroid: function(notification){
            // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too via the console fields as shown.
            //alert("In foreground " + notification.foreground  + " Coldstart " + notification.coldstart);

            var deferred = $q.defer();

            regId = notification.regid;
            window.localStorage['regId'] = regId;
            id_scheda = window.localStorage['id_scheda'];

            return _this.storeDeviceToken('registration')
                        .then(function(response){
                            return deferred.resolve(response);
                        }, function(error){
                            return deferred.reject();
                        });
        },

        handleIOS: function(notification){
            return null;
        },
        
        serverNotificationsCallback : function(){
        	
    		var param = {
				regid :  window.localStorage['regId']
    		};
    		var urlApi = ApiConfig.ovpEndpoint+'notification/cb/'+window.localStorage['id_scheda']+'/fields';
    		param[ApiConfig.wsKey] = 'JSON_CALLBACK';
    		param['nocache'] = new Date().getTime();
    		$http({
    			method: 'JSONP',
    			url: urlApi,
    			params: param,
    			cache: false
    		})
    		.success(function(data, status, headers, config){})
    		.error(function(data, status, headers, config){})
    		.then(function(response){});
    		
        },
        
        toggleChat : function(status){
        	var deferred = $q.defer();
        	regId = window.localStorage['regId'];

        	var operation = status === true ? 'enable_chat' : 'disable_chat';
            return _this.storeDeviceToken(operation)
                        .then(function(response){
                            return deferred.resolve(response);
                        }, function(error){
                            return deferred.reject();
                        });
        },
        
        getFromRifId : function(idRif){
        	
        	var deferred = $q.defer();
        	var param = {
				refId : idRif
    		};

    		var urlApi = ApiConfig.ovpEndpoint+'notification/get/'+window.localStorage['id_scheda']+'/fields';
    		param[ApiConfig.wsKey] = 'JSON_CALLBACK';
    		param['nocache'] = new Date().getTime();

    		return $http({
    			method: 'JSONP',
    			url: urlApi,
    			params : param,
    			cache: false
    		})
    		.success(function(data, status, headers, config){
    			_this.reference = data;
    			return deferred.resolve(data);
    		})
    		.error(function(data, status, headers, config){
                return deferred.reject();
            });
        },
        
        getReference : function(){
        	return _this.reference;
        }

    };

})

.factory('ListeContatti', function($http, $q, ApiConfig){
	
	var _this = this;
	
	return {
		
		getByType: function(type){
        	
        	var deferred = $q.defer();
        	
        	var urlApi = ApiConfig.ovpEndpoint+'liste_contatti/'+window.localStorage['id_scheda']+'/'+type+'/fields';
        	var param = {};
        	param[ApiConfig.wsKey] = 'JSON_CALLBACK';
        	param['nocache'] = new Date().getTime();
            
            $http({
                method: 'JSONP',
                url: urlApi,
                params: param,
                cache: false
            })
            .success(function(data, status, headers, config){
            	if(data.hasOwnProperty('error') != false){
            		deferred.reject(data.error);
            	}else{
        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
            
            return deferred.promise;
            
        }
		
	}
	
});