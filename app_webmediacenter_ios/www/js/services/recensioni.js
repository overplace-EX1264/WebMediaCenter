angular.module('recensioni.services', [])

.factory('Recensioni', function($http, $q, $cordovaToast, $ionicPopup, ApiConfig, Cache){

	var _this = this;

	_this.page = 1;
	_this.more = true;

	Cache.recensioniCache = [];
	Cache.recensioniCacheId = {};

	_this.moreList = function(){

		var deferred = $q.defer();

		var param = {};
		var urlApi = ApiConfig.ovpEndpoint+'commenti/'+window.localStorage['id_scheda']+'/'+_this.page+'/fields';
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
			var recensioniList = data['commenti'];
			var count = data['commenti'].length;
			
			for(var i=0; i<count; i++){
								
				//verifica se esiste l'id in cache
				if(Cache.recensioniCacheId.hasOwnProperty(recensioniList[i]['id'])){
					//verifica se l'oggetto in cache è diverso da quello in arrivo dal server
					
					var cache_obj = angular.extend({}, Cache.recensioniCacheId[recensioniList[i]['id']]);
					var server_obj = angular.extend({}, recensioniList[i]);
					
					delete cache_obj.$$hashKey;
					delete server_obj.$$hashKey;
					
					if(!equals(cache_obj, server_obj, false)){
						//aggiorna l'oggetto in cache
						var id_recensioneCache = Cache.recensioniCache.indexOf(Cache.recensioniCacheId[recensioniList[i]['id']]);
						Cache.recensioniCache[id_recensioneCache] = recensioniList[i];
						Cache.recensioniCacheId[recensioniList[i]['id']] = recensioniList[i];
					}
				}else{
					Cache.recensioniCacheId[recensioniList[i]['id']] = recensioniList[i];
					Cache.recensioniCache.push(recensioniList[i]);
				}

				arr_dataId.push(recensioniList[i]['id']);
			}


			if (_this.page == 1){
				//rimuove dalla cache i dati non pi� presenti
				for(var id in Cache.recensioniCacheId){
					if(arr_dataId.indexOf(id) == -1){
						Cache.recensioniCache.splice(Cache.recensioniCache.indexOf(Cache.recensioniCacheId[id]), 1);
						delete Cache.recensioniCacheId[id];
					}
				}
			}

			_this.more = data['more'];
			
			deferred.resolve(Cache.recensioniCache);

		})
		.error(function(data, status, headers, config){
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
			if (Cache.recensioniCache !== undefined && Object.keys(Cache.recensioniCache).length > 0){
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
			return (Cache.recensioniCache !== undefined && Object.keys(Cache.recensioniCache).length > 0) ? Cache.recensioniCache : this.refreshList();
		},

		get: function(id){
			return Cache.recensioniCacheId[id];
		},

		reply: function(recensione, risposta_commento){
			
			var deferred = $q.defer();

			var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/commenti_risposta/'+window.localStorage['id_scheda'];
			var param = {
				operation: 'create',
				id_padre: recensione.id,
				commento: risposta_commento
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
					
					var id_recensioneCache = Cache.recensioniCache.indexOf(Cache.recensioniCacheId[recensione.id]);
					
					var response = {id:data.id, commento:risposta_commento, id_tipologia_stato:data.id_tipologia_stato, timestamp:data.timestamp}; 
					
					Cache.recensioniCache[id_recensioneCache].risposta = response;
                	Cache.recensioniCacheId[recensione.id].risposta = response;

					deferred.resolve(response);
				}
			})
			.error(function(data, status, headers, config){
				deferred.reject();
			});

			return deferred.promise;
		}
	};


});