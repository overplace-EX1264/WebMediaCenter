angular.module('promozioni.services', [])

.factory('Promozioni', function($http, $q, $cordovaToast, $ionicPopup, ApiConfig, Cache) {

    var _this = this;
    
    this.getAll = function(){

        var deferred = $q.defer();
        
        Cache.promozioniCache = [];
        Cache.promozioniCacheId = {};
        
        var param = {};
        var urlApi = ApiConfig.ovpEndpoint+'promozioni/'+window.localStorage['id_scheda']+'/fields';
        param[ApiConfig.wsKey] = 'JSON_CALLBACK';
        param['nocache'] = new Date().getTime();
        
        $http({
            method: 'JSONP',
            url: urlApi,
            params: param,
            cache: false
        })
        .success(function(data, status, headers, config){
        	        	
        	var count = data.length;
	        for(var i=0; i<count; i++){
	        	data[i]['facebook'] = data[i]['facebook'] == '1' ? true : false;
	        	data[i]['twitter'] = data[i]['twitter'] == '1' ? true : false;

	        	Cache.promozioniCacheId[data[i]['id']] = data[i];
	        }

	        Cache.promozioniCache = data;

	        deferred.resolve(Cache.promozioniCache);

        })
        .error(function(data, status, headers, config){
        	deferred.reject();
        });

        return deferred.promise;
        
    };
        
    return {

    	refreshList: function(){

            var deferred = $q.defer();

            _this.getAll()
            	.then(function(response){
            		deferred.resolve(response);
            	}, function(error){
            		deferred.reject();
            	});
            
            return deferred.promise;

        },
        
        getList: function(){
        	
            if(Cache.promozioniCache !== undefined){
                return Cache.promozioniCache;
            }else{
                return this.refreshList();
            }

        },
        
        get: function(id){
            return Cache.promozioniCacheId[id];
        },
        
        update: function(promozione){
        	
        	var deferred = $q.defer();
        	        	
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/promozioni/'+window.localStorage['id_scheda'];
        	var param = {
        		operation: 'edit',
                id: promozione['id'],
                data_inizio: promozione['data_inizio'],
                token: promozione['token'],
                descrizione: promozione['descrizione']
        	};
        	
        	if(promozione.id_lista_email !== undefined){
        		param['id_lista_email'] = promozione.id_lista_email;
        	}
        	
        	if(promozione.id_lista_sms !== undefined){
        		param['id_lista_sms'] = promozione.id_lista_sms;
        	}
        	        	
        	if(promozione.facebook) param.facebook = true;
        	if(promozione.twitter) param.twitter = true;
        	
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
            		
                	Cache.promozioniCache.splice(Cache.promozioniCache.indexOf(promozione), 1);
                	
                	var notifiche = {pendenti:{email:0,sms:0,push:0},inviate:{email:0,sms:0,push:0}};
                	
					for(var key in data){
						if(promozione.hasOwnProperty(key)){
							promozione[key] = data[key];
						}

						if(key == 'notifiche'){
							if(data[key]['pendenti'] !== undefined){
								if(data[key]['pendenti']['email'] != undefined) notifiche['pendenti']['email'] = data[key]['pendenti']['email'];
								if(data[key]['pendenti']['sms'] != undefined) notifiche['pendenti']['sms'] = data[key]['pendenti']['sms'];
							}
							if(data[key]['inviate'] !== undefined){
								if(data[key]['inviate']['email'] != undefined) notifiche['inviate']['email'] = data[key]['inviate']['email'];
								if(data[key]['inviate']['sms'] != undefined) notifiche['inviate']['sms'] = data[key]['inviate']['sms'];
							}
						}
					}

					promozione['notifiche'] = notifiche;

					Cache.promozioniCache.unshift(promozione)
					
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