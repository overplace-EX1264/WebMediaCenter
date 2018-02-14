angular.module('eventi.services', [])

.factory('Eventi', function($http, $q, $cordovaCamera, $ionicPopup, ApiConfig, Cache) {

    var _this = this;

    _this.page = 1;
    _this.more = true;

    Cache.eventiCache = [];
    Cache.eventiCacheId = {};

	_this.moreList = function(){

		var deferred = $q.defer();

		var param = {};
		var urlApi = ApiConfig.ovpEndpoint+'eventi/'+window.localStorage['id_scheda']+'/'+_this.page+'/fields';
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
			var eventiList = data['response'];
			var count = data['response'].length;

			for(var i=0; i<count; i++){
				eventiList[i]['facebook'] = (eventiList[i]['facebook'] == '1') ? true : false;
				eventiList[i]['twitter'] = (eventiList[i]['twitter'] == '1') ? true : false;

				//verifica se esiste l'id in cache
				if(Cache.eventiCacheId.hasOwnProperty(eventiList[i]['id'])){
					//verifica se l'oggetto in cache è diverso da quello in arrivo dal server
					var cache_obj = angular.extend({}, Cache.eventiCacheId[eventiList[i]['id']]);
					var server_obj = angular.extend({}, eventiList[i]);
					delete cache_obj.$$hashKey;
					delete server_obj.$$hashKey;
					
					if(!equals(cache_obj, server_obj, false)){
						//aggiorna l'oggetto in cache
						var id_eventiCache = Cache.eventiCache.indexOf(Cache.eventiCacheId[eventiList[i]['id']]);
						Cache.eventiCache[id_eventiCache] = eventiList[i];
						Cache.eventiCacheId[eventiList[i]['id']] = eventiList[i];
					}
				}else{
					Cache.eventiCacheId[eventiList[i]['id']] = eventiList[i];
					Cache.eventiCache.push(eventiList[i]);
				}

				arr_dataId.push(eventiList[i]['id']);
			}


			if (_this.page == 1){
				//rimuove dalla cache i dati non pi� presenti
				for(var id in Cache.eventiCacheId){
					if(arr_dataId.indexOf(id) == -1){
						Cache.eventiCache.splice(Cache.eventiCache.indexOf(Cache.eventiCacheId[id]), 1);
						delete Cache.eventiCacheId[id];
					}
				}
			}

			_this.more = data['more'];

			deferred.resolve(Cache.eventiCache);

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
		    
				var box_image = document.getElementById('box-image-evento');
				
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
        	if (Cache.eventiCache !== undefined && Object.keys(Cache.eventiCache).length > 0){
				_this.page++;
				return _this.moreList();
			}else {
				_this.page = 1;
				return _this.moreList();
			}
        },

        getList: function(){
        	return (Cache.eventiCache !== undefined && Object.keys(Cache.eventiCache).length > 0) ? Cache.eventiCache : this.refreshList();
        },

        getMoreStatus: function(){
			return _this.more == undefined ? false : _this.more;
		},
        
        get: function(id){
            return Cache.eventiCacheId[id];
        },
        
        create: function(evento){
        	
        	var evento = angular.extend({}, evento);
        	
        	var deferred = $q.defer();
        	
        	var data_inizio_evento = new Date(evento['data_inizio_evento']);
        	var data_fine_evento = new Date(evento['data_fine_evento']);
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/eventi/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'create',
                titolo: evento['titolo'],
                descrizione: evento['testo'],
        		filename: evento['filename']
        	};
        	
        	if(evento.id_lista_email !== undefined){
        		param['id_lista_email'] = evento.id_lista_email;
        		param['email'] = true;
        	}
        	
        	if(evento.id_lista_sms !== undefined){
        		param['id_lista_sms'] = evento.id_lista_sms;
        		param['sms'] = true;
        	}
        	
        	param.data_inizio_evento = data_inizio_evento.toISOString().slice(0, 10);
        	param.ora_inizio = data_inizio_evento.getHours()+':'+data_inizio_evento.getMinutes()+':00';
        	
        	param.data_fine_evento = data_fine_evento.toISOString().slice(0, 10);
        	param.ora_fine = data_fine_evento.getHours()+':'+data_fine_evento.getMinutes()+':00';
        	
        	if(evento.twitter) param.twitter = true;
        	
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
        					evento[key] = data[key];
        				}

        				if(key == 'notifiche'){
        					if(data[key]['pendenti']['email'] != undefined) notifiche['pendenti']['email'] = data[key]['pendenti']['email'];
        					if(data[key]['pendenti']['sms'] != undefined) notifiche['pendenti']['sms'] = data[key]['pendenti']['sms'];
        				}
        			}
                	
                	evento['id'] = evento['id'].toString();
                	
                	evento['notifiche'] = notifiche;
                	
                	var d1 = new Date(evento['data_inizio_evento']);
                	evento['data_inizio_evento'] = d1.toISOString();
                	
                	var d2 = new Date(evento['data_fine_evento']);
                	evento['data_fine_evento'] = d2.toISOString();
                	
                	
                	if(Cache.eventiCache !== undefined) Cache.eventiCache.unshift(evento);
                	Cache.eventiCacheId[data['id']] = evento;
                	
        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	
        	return deferred.promise;
        	
        },
        
        update: function(evento,changeImage){
        	
        	var deferred = $q.defer();
        	
        	var data_inizio_evento = new Date(evento['data_inizio_evento']);
        	var data_fine_evento = new Date(evento['data_fine_evento']);
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/eventi/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'edit',
                id: evento['id'],
                data_inizio: evento['data_inizio'],
                token: evento['token'],
                titolo: evento['titolo'],
                descrizione: evento['testo']
        	};
        	        	
        	param.data_inizio_evento = data_inizio_evento.toISOString().slice(0, 10);
        	param.ora_inizio = data_inizio_evento.getHours()+':'+data_inizio_evento.getMinutes()+':00';
        	
        	param.data_fine_evento = data_fine_evento.toISOString().slice(0, 10);
        	param.ora_fine = data_fine_evento.getHours()+':'+data_fine_evento.getMinutes()+':00';
        	
        	if(changeImage){
        		param.filename = evento['filename'];
        	}
        	
        	if(evento.id_lista_email !== undefined){
        		param['id_lista_email'] = evento.id_lista_email;
        	}
        	
        	if(evento.id_lista_sms !== undefined){
        		param['id_lista_sms'] = evento.id_lista_sms;
        	}
        	
        	if(evento.twitter) param.twitter = true;
        	
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
            		var id_eventoCache = Cache.eventiCache.indexOf(Cache.eventiCacheId[evento['id']]);
                	
                	for(var key in data){
        				if(evento.hasOwnProperty(key)){
    	    				evento[key] = data[key];
        				}

        				if(key == 'notifiche'){
        					if(data[key]['pendenti'] !== undefined){
        						if(data[key]['pendenti']['email'] != undefined) evento['notifiche']['pendenti']['email'] = data[key]['pendenti']['email'];
        						if(data[key]['pendenti']['sms'] != undefined) evento['notifiche']['pendenti']['sms'] = data[key]['pendenti']['sms'];
        					}
        					if(data[key]['inviate'] !== undefined){
        						if(data[key]['inviate']['email'] != undefined) evento['notifiche']['inviate']['email'] = data[key]['inviate']['email'];
        						if(data[key]['inviate']['sms'] != undefined) evento['notifiche']['inviate']['sms'] = data[key]['inviate']['sms'];
        					}
        				}
        			}
                	
                	Cache.eventiCache[id_eventoCache] = evento;
                	Cache.eventiCacheId[evento['id']] = evento;
                			
        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	
        	return deferred.promise;
        	
        },
        
        delete: function(evento){
                	
        	var deferred = $q.defer();
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/eventi/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'delete',
                id: evento['id'],
                data_inizio: evento['data_inizio'],
                token: evento['token']
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
            		if(Cache.eventiCache.indexOf(Cache.eventiCacheId[data['id']]) != -1){
						Cache.eventiCache.splice(Cache.eventiCache.indexOf(Cache.eventiCacheId[data['id']]), 1);
						delete Cache.eventiCacheId[data['id']];
					}

        	        deferred.resolve(Cache.eventiCache);

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