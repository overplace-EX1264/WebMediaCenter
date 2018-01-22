angular.module('riepilogo.services', [])

.factory('Riepilogo', function($http, $q, ApiConfig, Cache){

	var _this = this;

	_this.month = 0;

	Cache.riepilogoCache = {};

	_this.getAll = function(){

		var deferred = $q.defer();

		var param = {};
		var urlApi = ApiConfig.ovpEndpoint+'riepilogo/'+window.localStorage['id_scheda']+'/'+_this.month+'/fields';
		param[ApiConfig.wsKey] = 'JSON_CALLBACK';

		$http({
			method: 'JSONP',
			url: urlApi,
			params: param,
			cache: false
		})
		.success(function(data, status, headers, config){
			Cache.riepilogoCache = data;
			deferred.resolve(Cache.riepilogoCache);
		})
		.error(function(data, status, headers, config){
			deferred.reject();
		});

		return deferred.promise;
	};

	return {

		getList: function(){
			if (Cache.riepilogoCache != undefined && Object.keys(Cache.riepilogoCache).length > 0 )
				return Cache.riepilogoCache;
			else
				return this.refreshList();
		},

		get: function(name){

			var obj = {
				periodo: Cache.riepilogoCache.periodo,
				dati: Cache.riepilogoCache.dati[name],
				soglie: Cache.riepilogoCache.soglie[name],
				esito: Cache.riepilogoCache.esito.dettaglio[name]
			};

			return obj;
		},

		refreshList: function(){
			var deferred = $q.defer();

			_this.getAll().then(function(response){
				deferred.resolve(response);
			}, function(error){
				deferred.reject();
			});

			return deferred.promise;
		},

		changePeriod: function(numero_mesi){
			_this.month = (numero_mesi < 0) ? 0 : numero_mesi;
			var deferred = $q.defer();

			_this.getAll().then(function(response){
				deferred.resolve(response);
			}, function(error){
				deferred.reject();
			});

			return deferred.promise;
		}
	};


});