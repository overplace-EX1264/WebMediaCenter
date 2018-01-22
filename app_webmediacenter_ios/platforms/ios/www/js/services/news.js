angular.module('news.services', [])

.factory('News', function($http, $q, $cordovaCamera, $ionicPopup, ApiConfig, Cache) {

    var _this = this;

    _this.page = 1;
    _this.more = true;

    Cache.newsCache = [];
    Cache.newsCacheId = {};

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
				newsList[i]['facebook'] = (newsList[i]['facebook'] == '1') ? true : false;
            	newsList[i]['twitter'] = (newsList[i]['twitter'] == '1') ? true : false;
            	newsList[i]['linkedin'] = (newsList[i]['linkedin'] == '1') ? true : false;
            	newsList[i]['shared_linkedin'] = (newsList[i]['linkedin'] == '1') ? true : false;
            	
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
		    
				var box_image = document.getElementById('box-image-news');
				
				var img = new Image();
				img.src = "data:image/jpeg;base64,"+imageData;
				img.onload = function(){
					if(this.width < this.height){

						var tmpl;
						if (options.hasOwnProperty("mediaType") && options.mediaType == 0){
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
		    	    	deferred.resolve("data:image/jpeg;base64,"+imageData);
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
    
    return {

    	refreshList: function(){
    		_this.page = 1;
            var deferred = $q.defer();

            _this.moreList().then(function(response){
				deferred.resolve(response);
			}, function(error){
				deferred.reject();
			});
            
            return deferred.promise;

        },


        loadMore: function(){
			if (Cache.newsCache !== undefined && Object.keys(Cache.newsCache).length > 0){
				_this.page++;
                return _this.moreList();
			}else {
				_this.page = 1;
                return _this.moreList();
			}
        },

		getMoreStatus: function(){
			return _this.more == undefined ? false : _this.more;
		},

        getList: function(){
            return (Cache.newsCache !== undefined && Object.keys(Cache.newsCache).length > 0) ? Cache.newsCache : this.refreshList();
        },
        
        get: function(id){
            return Cache.newsCacheId[id];
        },
        
        create: function(news){
        	
        	var news = angular.extend({}, news);
        	
        	var deferred = $q.defer();
        	
        	var now = new Date();
        	var date = new Date(news['data_inizio_pubblicazione']);
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/news/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'create',
                titolo: news['titolo'],
                messaggio: news['testo'],
        		filename: news['filename']
        	};
        	
        	if(news.id_lista_email !== undefined){
        		param['id_lista_email'] = news.id_lista_email;
        		param['email'] = true; 
        	}
        	if(news.id_lista_sms !== undefined){
        		param['id_lista_sms'] = news.id_lista_sms;
        		param['sms'] = true;
        	}
        	
        	if(date.getTime() > now.getTime()){
        		param.data_inizio_pubblicazione = date.toISOString().slice(0, 10);
        		param.ora_inizio = date.getHours()+':'+date.getMinutes()+':00';
        	}
        	        	
        	if(news.facebook) param.facebook = true;
        	if(news.twitter) param.twitter = true;
        	if(news.linkedin) param.linkedin = true;
        	
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
                	var notifiche = {pendenti:{email:false,sms:false,push:false},inviate:{email:0,sms:0,push:0}};
                	                	                	
                	for(var key in data){
        				if(key != 'success' && key != 'notifiche'){
    	    				news[key] = data[key];
        				}

        				if(key == 'notifiche'){
        					if(data[key]['pendenti']['email'] != undefined) notifiche['pendenti']['email'] = data[key]['pendenti']['email'];
        					if(data[key]['pendenti']['sms'] != undefined) notifiche['pendenti']['sms'] = data[key]['pendenti']['sms'];
        				}
        			}
                	
                	news['id'] = news['id'].toString();
                	news['shared_linkedin'] = (news['linkedin'] == '1') ? true : false;
                	news['notifiche'] = notifiche;

                	var d = new Date(news['data_inizio_pubblicazione']);
                	news['data_inizio_pubblicazione'] = d.toISOString();

                	if(Cache.newsCache !== undefined) Cache.newsCache.unshift(news);
                	Cache.newsCacheId[data['id']] = news;
                	
        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	
        	return deferred.promise;
        	
        },
        
        update: function(news,changeImage){
        	
        	var deferred = $q.defer();
        	
        	var now = new Date();
        	var date = new Date(news['data_inizio_pubblicazione']); 
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/news/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'edit',
                id: news['id'],
                data_inizio: news['data_inizio'],
                token: news['token'],
                titolo: news['titolo'],
                messaggio: news['testo']
        	};
        	        	
        	if(date.getTime() > now.getTime()){
        		param.data_inizio_pubblicazione = date.toISOString().slice(0, 10);
        		param.ora_inizio = date.getHours()+':'+date.getMinutes()+':00';
        	}
        	
        	if(changeImage){
        		param.filename = news['filename'];
        	}
        	
        	if(news.id_lista_email !== undefined){
        		param['id_lista_email'] = news.id_lista_email;
        	}
        	
        	if(news.id_lista_sms !== undefined){
        		param['id_lista_sms'] = news.id_lista_sms;
        	}
        	        	
        	if(news.facebook) param.facebook = true;
        	if(news.twitter) param.twitter = true;
        	if(news.linkedin) param.linkedin = true;
        	
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

                	var id_newsCache = Cache.newsCache.indexOf(Cache.newsCacheId[news['id']]);

                	var notifiche = {pendenti:{email:false,sms:false,push:false},inviate:{email:0,sms:0,push:0}};
                	
                	for(var key in data){
        				if(news.hasOwnProperty(key)){
    	    				news[key] = data[key];
        				}
        				
        				if(key == 'notifiche'){
        					if(data[key]['pendenti'] !== undefined){
        						if(data[key]['pendenti']['email'] != undefined) news['notifiche']['pendenti']['email'] = data[key]['pendenti']['email'];
        						if(data[key]['pendenti']['sms'] != undefined) news['notifiche']['pendenti']['sms'] = data[key]['pendenti']['sms'];
        					}
        					if(data[key]['inviate'] !== undefined){
        						if(data[key]['inviate']['email'] != undefined) news['notifiche']['inviate']['email'] = data[key]['inviate']['email'];
        						if(data[key]['inviate']['sms'] != undefined) news['notifiche']['inviate']['sms'] = data[key]['inviate']['sms'];
        					}
        				}
        			}
                	
                	news['shared_linkedin'] = (news['linkedin'] == '1') ? true : false;
                	
                	Cache.newsCache[id_newsCache] = news;
                	Cache.newsCacheId[news['id']] = news;

        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	
        	return deferred.promise;
        	
        },
        
        delete: function(news){
                	
        	var deferred = $q.defer();
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/news/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'delete',
                id: news['id'],
                data_inizio: news['data_inizio'],
                token: news['token']
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
                	if(Cache.newsCache.indexOf(Cache.newsCacheId[data['id']]) != -1){
						Cache.newsCache.splice(Cache.newsCache.indexOf(Cache.newsCacheId[data['id']]), 1);
						delete Cache.newsCacheId[data['id']];
					}

        	        deferred.resolve(Cache.newsCache);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            })
        		
        	return deferred.promise;
        	
        },
        
        useCamera: function(options){
        	
        	var deferred = $q.defer();
        	
        	_this.camera(options)
	        	.then(function(response){
	        		deferred.resolve(response);
	        	}, function(error){
	        		deferred.reject();
	        	});
        
        	return deferred.promise;
        }
    }

});
