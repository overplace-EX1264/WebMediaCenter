angular.module("coupon.services", [])

.factory("Coupon", function($http, $q, $cordovaCamera, $ionicPopup, ApiConfig, Cache, $ionicLoading){

    var _this = this;

	_this.page = 1;
	_this.more = true;

	Cache.couponCache = [];
	Cache.couponCacheId = {};

    _this.moreList = function(){
    	
		var deferred = $q.defer();

		var param = {};
		var urlApi = ApiConfig.ovpEndpoint+'coupon/'+window.localStorage['id_scheda']+'/'+_this.page+'/fields';
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
			var couponList = data['response'];
			var count = data['response'].length;

			for(var i=0; i<count; i++){
				couponList[i]['facebook'] = (couponList[i]['facebook'] == '1') ? true : false;
				couponList[i]['twitter'] = (couponList[i]['twitter'] == '1') ? true : false;

				//verifica se esiste l'id in cache
				if(Cache.couponCacheId.hasOwnProperty(couponList[i]['id'])){
					//verifica se l'oggetto in cache è diverso da quello in arrivo dal server
					
					var cache_obj = angular.extend({}, Cache.couponCacheId[couponList[i]['id']]);
					var server_obj = angular.extend({}, couponList[i]);
					
					delete cache_obj.$$hashKey;
					delete server_obj.$$hashKey;
					
					if(!equals(cache_obj, server_obj, false)){
						//aggiorna l'oggetto in cache
						var id_couponCache = Cache.couponCache.indexOf(Cache.couponCacheId[couponList[i]['id']]);
						Cache.couponCache[id_couponCache] = couponList[i];
						Cache.couponCacheId[couponList[i]['id']] = couponList[i];
					}					
				}else{
					Cache.couponCacheId[couponList[i]['id']] = couponList[i];
					Cache.couponCache.push(couponList[i]);
				}

				arr_dataId.push(couponList[i]['id']);
			}


			if (_this.page == 1){
				//rimuove dalla cache i dati non più presenti
				for(var id in Cache.couponCacheId){
					if(arr_dataId.indexOf(id) == -1){
						Cache.couponCache.splice(Cache.couponCache.indexOf(Cache.couponCacheId[id]), 1);
						delete Cache.couponCacheId[id];
					}
				}
			}

			_this.more = data['more'];

			deferred.resolve(Cache.couponCache);

		})
		.error(function(data, status, headers, config){
			deferred.reject();
		});

		return deferred.promise;
    };

    this.camera = function(options){

        var deferred = $q.defer();

        $cordovaCamera.getPicture(options).then(function(imageData){
            var box_image = document.getElementById('box-image-coupon');

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
                        if(ok) {
							$ionicLoading.show();
							_this.camera(options).then(function (response) {
								deferred.resolve(response);
							},function (err) {
								if(err != "Selection cancelled." && err != "Camera cancelled."){
									$ionicPopup.alert({
										title: 'Attenzione',
										template: 'L\'immagine non pu&ograve; essere utilizzata in quanto non risiede fisicamente sul tuo device.'
									});
								}
								deferred.reject();							
							});
							return deferred.promise;
						}
                    });
                }else{
                    deferred.resolve("data:image/jpeg;base64,"+imageData);
                }
            }

        }, function(err){
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
			if (Cache.couponCache !== undefined && Object.keys(Cache.couponCache).length > 0){
				_this.page++;
				return _this.moreList();
			}else {
				_this.page = 1;
				return _this.moreList();
			}
		},

		getMoreStatus: function(){
        	return (_this.more == undefined) ? false : _this.more;
        },
        
        getList: function(){
            return (Cache.couponCache !== undefined && Object.keys(Cache.couponCache).length > 0) ? Cache.couponCache : this.refreshList();
        },

        get: function(id){
        	return Cache.couponCacheId[id];
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
        },

        scadenza_coupon: function(dateTime, duration){
            var d = new Date(dateTime);
            var toDay = d.getDate()+parseInt(duration);

            d.setDate(toDay);
            return d.getTime();
        },

        checkDate: function(dateTimeStart, dateTimeEnd){

        	var date_start = new Date(dateTimeStart).toISOString().slice(0, 10);        	
        	var date_end = new Date(dateTimeEnd).toISOString().slice(0, 10);
    		
        	var deferred = $q.defer();

			var param = {};
			var urlApi = ApiConfig.ovpEndpointHmac+'app/post/coupon_check_date/'+window.localStorage['id_scheda'];

			param['data_inizio_erogazione'] = date_start;
			param['data_fine_erogazione'] = date_end;

			$http({
				method: 'POST',
				url: urlApi,
				data: JSON.stringify(param).replace(/\//g,'\\/'),
				cache: false,
				hmac: true
			}).success(function(data, status, headers, config){
				deferred.resolve(data);
			}).error(function(data, status, headers, config){
				deferred.reject(data);
			});

			return deferred.promise;

        },
        
        create: function(coupon){
        	
        	var coupon = angular.extend({}, coupon);
        	        	
        	var deferred = $q.defer();
        	
        	var date_start = new Date(coupon['data_inizio_erogazione']);
        	var date_end = new Date(coupon['data_fine_erogazione']);
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/coupon/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'create',
                titolo: coupon['titolo'],
                descrizione: coupon['descrizione'],
                sconto: coupon['sconto'],
                condizioni_legali: coupon['condizioni_legali'],
                numero_coupon_erogabili: coupon['numero_coupon_erogabili'],
                coupon_illimitati: coupon['coupon_illimitati'],
                data_inizio_erogazione: date_start.toISOString().slice(0, 10),
                data_fine_erogazione: date_end.toISOString().slice(0, 10),
                durata_coupon: coupon['durata_coupon'],  
                filename: coupon['filename']
        	};
        	
        	if(coupon.id_lista_email !== undefined){
        		param['id_lista_email'] = coupon.id_lista_email;
        		param['email'] = true; 
        	}
        	if(coupon.id_lista_sms !== undefined){
        		param['id_lista_sms'] = coupon.id_lista_sms;
        		param['sms'] = true;
        	}
        	        	        	
        	if(coupon.facebook) param.facebook = true;
        	if(coupon.twitter) param.twitter = true;
        	
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
    	    				coupon[key] = data[key];
        				}

        				if(key == 'notifiche'){
        					if(data[key]['pendenti']['email'] != undefined) notifiche['pendenti']['email'] = data[key]['pendenti']['email'];
        					if(data[key]['pendenti']['sms'] != undefined) notifiche['pendenti']['sms'] = data[key]['pendenti']['sms'];
        				}
        			}
                	
                	coupon['id'] = coupon['id'].toString();
                	
                	coupon['notifiche'] = notifiche;
                	
                	if(Cache.couponCache !== undefined) Cache.couponCache.unshift(coupon);
                	Cache.couponCacheId[data['id']] = coupon;
                	
        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	        	
        	return deferred.promise;
        	
        },
        
        update: function(coupon,changeImage){
        	
        	var deferred = $q.defer();
        	
        	var date_start = new Date(coupon['data_inizio_erogazione']);
        	var date_end = new Date(coupon['data_fine_erogazione']);
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/coupon/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'edit',
                id: coupon['id'],
                data_inizio: coupon['data_inizio'],
                token: coupon['token'],
                titolo: coupon['titolo'],
                descrizione: coupon['descrizione'],
                sconto: coupon['sconto'],
                condizioni_legali: coupon['condizioni_legali'],
                numero_coupon_erogabili: coupon['numero_coupon_erogabili'],
                coupon_illimitati: coupon['coupon_illimitati'],
                data_inizio_erogazione: date_start.toISOString().slice(0, 10),
                data_fine_erogazione: date_end.toISOString().slice(0, 10),
                durata_coupon: coupon['durata_coupon']
        	};
        	        	
        	if(changeImage){
        		param.filename = coupon['filename'];
        	}
        	
        	if(coupon.id_lista_email !== undefined){
        		param['id_lista_email'] = coupon.id_lista_email;
        	}
        	
        	if(coupon.id_lista_sms !== undefined){
        		param['id_lista_sms'] = coupon.id_lista_sms;
        	}
        	
        	if(coupon.facebook) param.facebook = true;
        	if(coupon.twitter) param.twitter = true;
        	        	
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
                	
            		var id_couponCache = Cache.couponCache.indexOf(Cache.couponCacheId[coupon['id']]);
            		                	
                	for(var key in data){
        				if(coupon.hasOwnProperty(key)){
        					coupon[key] = data[key];
        				}

        				if(key == 'notifiche'){
            				if(data[key]['pendenti'] != undefined){
            					if(data[key]['pendenti']['email'] != undefined) coupon['notifiche']['pendenti']['email'] = data[key]['pendenti']['email'];
            					if(data[key]['pendenti']['sms'] != undefined) coupon['notifiche']['pendenti']['sms'] = data[key]['pendenti']['sms'];
            				}
            				if(data[key]['inviate'] != undefined){
            					if(data[key]['inviate']['email'] != undefined) coupon['notifiche']['inviate']['email'] = data[key]['inviate']['email'];
            					if(data[key]['inviate']['sms'] != undefined) coupon['notifiche']['inviate']['sms'] = data[key]['inviate']['sms'];
            				}
        				}
        			}
                	
                	Cache.couponCache[id_couponCache] = coupon;
                	Cache.couponCacheId[coupon['id']] = coupon;
                			
        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	
        	return deferred.promise;
        	
        },
        
        delete: function(coupon){
        	
        	var deferred = $q.defer();
        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/coupon/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'delete',
                id: coupon['id'],
                data_inizio: coupon['data_inizio'],
                token: coupon['token']
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
            		if(Cache.couponCache.indexOf(Cache.couponCacheId[data['id']]) != -1){
						Cache.couponCache.splice(Cache.couponCache.indexOf(Cache.couponCacheId[data['id']]), 1);
						delete Cache.couponCacheId[data['id']];
					}

        	        deferred.resolve(Cache.couponCache);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            })
        		
        	return deferred.promise;
        	
        }
    };

});