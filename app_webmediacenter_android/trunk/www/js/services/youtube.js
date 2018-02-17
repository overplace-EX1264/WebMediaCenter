angular.module('youtube.services', [])

.factory('Youtube', function($http, $q, $cordovaCamera, $ionicPopup, ApiConfig, Cache) {

    var _this = this;

    _this.page = 1;
    _this.more = true;

    Cache.newsCache = [];
    Cache.newsCacheId = {};
	var deferred = $q.defer();
    _this.moreList = function(){

		var deferred = $q.defer();

		var param = {};
		var urlApi = ApiConfig.ovpEndpoint+'news/'+window.localStorage['id_scheda']+'/'+_this.page+'/fields';
		param[ApiConfig.wsKey] = 'JSON_CALLBACK';
		param['nocache'] = new Date().getTime();
		
		$http({
			method: 'JSONP',
			url: urlApi,
			params: param,
			cache: false
		})
		.success(function(data, status, headers, config){
			
			var arr_dataId = [];
			var newsList = data['response'];
			var count = data['response'].length;
						
			for(var i=0; i<count; i++){
				/*newsList[i]['facebook'] = (newsList[i]['facebook'] == '1') ? true : false;
            	newsList[i]['twitter'] = (newsList[i]['twitter'] == '1') ? true : false;
            	newsList[i]['linkedin'] = (newsList[i]['linkedin'] == '1') ? true : false;
            	newsList[i]['shared_linkedin'] = (newsList[i]['linkedin'] == '1') ? true : false;*/
            	
				//verifica se esiste l'id in cache
				if(Cache.newsCacheId.hasOwnProperty(newsList[i]['id'])){
					//verifica se l'oggetto in cache è diverso da quello in arrivo dal server
					
					var cache_obj = angular.extend({}, Cache.newsCacheId[newsList[i]['id']]);
					var server_obj = angular.extend({}, newsList[i]);
					
					delete cache_obj.$$hashKey;
					delete server_obj.$$hashKey;
					
					if(!equals(cache_obj, server_obj, false)){
						//aggiorna l'oggetto in cache
						var id_newsCache = Cache.newsCache.indexOf(Cache.newsCacheId[newsList[i]['id']]);
						Cache.newsCache[id_newsCache] = newsList[i];
						Cache.newsCacheId[newsList[i]['id']] = newsList[i];
					}
				}else{
					Cache.newsCacheId[newsList[i]['id']] = newsList[i];
					Cache.newsCache.push(newsList[i]);
				}

				arr_dataId.push(newsList[i]['id']);
			}


			if (_this.page == 1){
				//rimuove dalla cache i dati non più presenti
				for(var id in Cache.newsCacheId){
					if(arr_dataId.indexOf(id) == -1){
						Cache.newsCache.splice(Cache.newsCache.indexOf(Cache.newsCacheId[id]), 1);
						delete Cache.newsCacheId[id];
					}
				}
			}

	        _this.more = data['more'];

			deferred.resolve(Cache.newsCache);

		})
		.error(function(data, status, headers, config){
			deferred.reject();
		});

		return deferred.promise;
    };
    
    this.camera = function(options){
    	var deferred = $q.defer();
    	
    	
	    $cordovaCamera.getPicture(options)
	    	.then(function(imageData){
				// var box_image = document.getElementById('box-image-news');
				
				var img = new Image();
				
				img.src = imageData;
				deferred.resolve(imageData);
				img.onload = function() {
					if(this.width < this.height){
						alert("Inside")
						var tmpl;
						if (options.hasOwnProperty("mediaType") && options.mediaType == 1){
							tmpl = 'La larghezza dell\'immagine deve essere superiore alla sua altezza!<br>Scegli un\'altra immagine.';
						}else{
							tmpl = 'La larghezza dell\'immagine deve essere superiore alla sua altezza!<br>Ruota lo smartphone.';
						}

						var confirmPopup = $ionicPopup.confirm({
							title: 'Attenzione',
			                template: tmpl,
			                okText: 'OK',
			                cancelText : 'Annulla'
			            });
			            confirmPopup.then(function(ok){
			                if(ok) _this.camera(options);
			            });
		    	    }else{
		    	    	deferred.resolve(imageData);
		    	    }
				}
			    
			},function(err){
				if(err != "Selection cancelled." && err != "Camera cancelled."){
					$ionicPopup.alert({
						title: 'Attenzione',
						template: 'L\'immagine non pu&ograve; essere utilizzata in quanto non risiede fisicamente sul tuo device.'
					});
				}
				deferred.reject();
			});
	    
	    return deferred.promise;
	    
	};
	this.videoCamera = function(options){
    	
    	var deferred = $q.defer();
	    navigator.device.capture.captureVideo(onSuccess, onError, options);
        function onSuccess(mediaFiles) {
			console.log("mediaFiles");
			console.log(mediaFiles);
			deferred.resolve(mediaFiles);
        }
        function onError(error) {
			deferred.reject();
        }
	    
	    return deferred.promise;
	    
    };
    this.buildApiRequest = function (requestMethod, path, params, properties) {
		var deferred = $q.defer();
		var request;
          request = gapi.client.request({
              'method': requestMethod,
              'path': path,
              'params': params
          });
        // executeRequest(request);
        request.execute(function(listData) {
            deferred.resolve(listData);
        },function(error) {
			deferred.reject();
		});
		return deferred.promise;
	};
	this.GoogleLogin = function () {
		var deferred = $q.defer();
		window.plugins.googleplus.login(
			{
			  'scopes': ApiConfig.gPScopes,
			  'webClientId': ApiConfig.yoClientId,
			  'offline': false
			},
			function (response){
				deferred.resolve(response);
			}, function(error){
				deferred.reject();
			});
			return deferred.promise;
	};
	this.googleAuth = function () {
		var deferred = $q.defer();
		gapi.auth.init(function() {
			gapi.auth.authorize({
				client_id: ApiConfig.webClientId,
				scope: ApiConfig.gScopes,
				discoveryDocs: ApiConfig.discoveryDocs,
				immediate: true
			  }, function (authResult) {
				if (authResult && !authResult.error) {
					window.localStorage.authResult = JSON.stringify(authResult);
					deferred.resolve(authResult);
				} else {
					deferred.reject();
				}
			  });
		});  
		return deferred.promise;
	};
	this.gapiSetToken = function (token) {
		var deferred = $q.defer();
		gapi.client.setToken({access_token:token});
		deferred.resolve(true);
		return deferred.promise;
	}

    return {
        
        useCamera: function(options){

        	
        	_this.camera(options)
	        	.then(function(response){
	        		deferred.resolve(response);
	        	}, function(error){
	        		deferred.reject();
	        	});
        	return deferred.promise;
		}, 


		/*loadMore: function(){
			if (Cache.newsCache !== undefined && Object.keys(Cache.newsCache).length > 0){
				_this.page++;
                return _this.moreList();
			}else {
				_this.page = 1;
                return _this.moreList();
			}
		},*/
		usevideoCamera:function (options) {
			_this.videoCamera(options)
	        	.then(function(response){
	        		deferred.resolve(response);
	        	}, function(error){
	        		deferred.reject();
	        	});
        	return deferred.promise;
		},		
		getUser: function(){
			return JSON.parse(window.localStorage.starter_google_user || false);
		  },
		setUser: function(user_data) {
			window.localStorage.starter_google_user = JSON.stringify(user_data);
		  },
		removeUser: function(user_data) {
			window.localStorage.starter_google_user = '';
		},
		buildApiRequest:function (requestMethod, path, params, properties) {
			var deferred = $q.defer();
			var request;
			// request = gapi.client.request({
			// 	'method': requestMethod,
			// 	'path': path,
			// 	'params': params
			// });
			if (properties) {
				var resource = createResource(properties);
				request = gapi.client.request({
					'body': resource,
					'method': requestMethod,
					'path': path,
					'params': params
				});
			  } else {
				request = gapi.client.request({
					'method': requestMethod,
					'path': path,
					'params': params
				});
			  }
			// executeRequest(request);
			request.execute(function(listData) {
				deferred.resolve(listData);
			},function(error) {
				deferred.reject();
			});
			return deferred.promise;
			function createResource(properties) {
				var resource = {};
				var normalizedProps = properties;
				for (var p in properties) {
				  var value = properties[p];
				  if (p && p.substr(-2, 2) == '[]') {
					var adjustedName = p.replace('[]', '');
					if (value) {
					  normalizedProps[adjustedName] = value.split(',');
					}
					delete normalizedProps[p];
				  }
				}
				for (var p in normalizedProps) {
				  // Leave properties that don't have values out of inserted resource.
				  if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
					var propArray = p.split('.');
					var ref = resource;
					for (var pa = 0; pa < propArray.length; pa++) {
					  var key = propArray[pa];
					  if (pa == propArray.length - 1) {
						ref[key] = normalizedProps[p];
					  } else {
						ref = ref[key] = ref[key] || {};
					  }
					}
				  };
				}
				return resource;
			  }
			
		},
		
		GoogleLogin: function () {
			var deferred = $q.defer();
			window.plugins.googleplus.login(
				{
				  'scopes': ApiConfig.gPScopes,
				  'webClientId': ApiConfig.webClientId,
				  'offline': false
				},
				function (response){
					console.log(JSON.stringify(response));
					window.localStorage.window_google_user = JSON.stringify(response);
					deferred.resolve(response);
				}, function(error){
					deferred.reject();
				});
				return deferred.promise;
		},
		googleAuth: function () {
			var deferred = $q.defer();
			gapi.auth.init(function() {
				gapi.auth.authorize({
					client_id: ApiConfig.yoClientId,
					scope: ApiConfig.gScopes,
					discoveryDocs: ApiConfig.discoveryDocs,
					immediate: true
				}, function (authResult) {
					if (authResult && !authResult.error) {
						window.localStorage.authResult = JSON.stringify(authResult);
						deferred.resolve(authResult);
					} else {
						deferred.reject();
					}
				});
			});  
			return deferred.promise;
		},
		gapiSetToken: function (token) {
			gapi.client.setToken({access_token:token});
		},
		googleLogout : function () {
			var deferred = $q.defer();
			window.plugins.googleplus.disconnect(
			// window.plugins.googleplus.logout(
				function (msg) {
					window.localStorage.starter_google_user = '';
					window.localStorage.authResult = '';
					window.localStorage.window_google_user = '';
					// setTimeout(() => {
						console.log(JSON.stringify(msg))
					// }, 100);
					deferred.resolve(msg);
				},
				function(fail){
					console.log(JSON.stringify(fail));
					// deferred.reject();
					// window.plugins.googleplus.trySilentLogin(
					// 	{
					// 	},
					// 	function (obj) {
					// 		console.error('Google trySilentLogin success');
					// 		//try logout again
					// 		window.plugins.googleplus.logout(
					// 			function (mg) {
					// 				deferred.resolve(mg);
					// 				console.error('Google logout success');
					// 			},
					// 			function (err) {
									console.error('Error logging out from Google for the 2nd time: ' + err);
									deferred.reject()
					// 			}
					// 		);
					// 	},
					// 	function (err) {
					// 		console.error('Google trySilentLogin error: ' + err);
					// 	}
					// );
				}
			);
			return deferred.promise;
		}
    }
});