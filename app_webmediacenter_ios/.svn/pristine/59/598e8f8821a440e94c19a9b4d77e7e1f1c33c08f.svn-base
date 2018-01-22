angular.module('convalide.services', [])

.factory('Convalide', function($http, $q, $cordovaToast, ApiConfig, NavBadges, Cache) {

    var _this = this;

    this.getAll = function(){

        var deferred = $q.defer();

        Cache.convalideCache = [];
        Cache.convalideCacheAll = [];
        Cache.convalideCacheId = {};

        var param = {};
        var urlApi = ApiConfig.ovpEndpoint+'convalide/'+window.localStorage['id_scheda']+'/fields';
        param[ApiConfig.wsKey] = 'JSON_CALLBACK';
        param['nocache'] = new Date().getTime();

        return $http({
                    method: 'JSONP',
                    url: urlApi,
                    params: param,
                    cache: false
                })
                .success(function(data, status, headers, config){

                    var convalide_list_pending_all = [];
                    var convalide_list_approved_all = [];

                    var convalide_list_pending = [];
                    var convalide_list_approved = [];

                    var removed = (window.localStorage['convalideRemoved'] !== undefined && window.localStorage['convalideRemoved'].length > 0 && JSON.parse(window.localStorage['convalideRemoved']).length > 0) ? JSON.parse(window.localStorage['convalideRemoved']) : [];

                    var count = data.length;
                    for(var i=0; i<count; i++){

                        Cache.convalideCacheId[data[i]['id']] = data[i];

                        var toAdd = (removed.length > 0 && removed.indexOf(data[i].id) != -1) ? false : true;

                        if(data[i]['type'] == 'checkin'){
                            if(data[i]['stato'] == 0){
                                if(toAdd) convalide_list_pending.push(data[i]);
                                convalide_list_pending_all.push(data[i]);
                            }else{
                                if(toAdd) convalide_list_approved.push(data[i]);
                                convalide_list_approved_all.push(data[i]);
                            }
                        }

                        if(data[i]['type'] == 'prenotazione'){
                            if(data[i]['stato'] == 1){
                                if(toAdd) convalide_list_pending.push(data[i]);
                                convalide_list_pending_all.push(data[i]);
                            }else{
                                if(toAdd) convalide_list_approved.push(data[i]);
                                convalide_list_approved_all.push(data[i]);
                            }
                        }

                    }

                    Cache.convalideCache = {pending: convalide_list_pending, approved: convalide_list_approved};
                    Cache.convalideCacheAll = {pending: convalide_list_pending_all, approved: convalide_list_approved_all};

                    return deferred.resolve(Cache.convalideCache);

                })
                .error(function(data, status, headers, config){
                    return deferred.reject();
                });
    };

    return {

        refreshList: function(){

            var deferred = $q.defer();

            return _this.getAll()
                        .then(function(response){
                            NavBadges.setBadges('convalide', Cache.convalideCache['pending'].length);
                            return deferred.resolve(response.data);
                        }, function(error){
                            return deferred.reject();
                        });

        },

        count: function(){
            NavBadges.setBadges('convalide', Cache.convalideCache['pending'].length);
        },

        getList: function(){

            if(Cache.convalideCache.pending !== undefined || Cache.convalideCache.approved !== undefined){
                return Cache.convalideCache;
            }else{
                return this.refreshList();
            }

        },

        getTotalCount: function(){

            var count = (Cache.convalideCacheAll.pending !== undefined && Cache.convalideCacheAll.approved !== undefined) ? Cache.convalideCacheAll.pending.length + Cache.convalideCacheAll.approved.length : 0;
            return count;

        },

        resync: function(){

            if(window.localStorage['convalideRemoved'] !== undefined && window.localStorage['convalideRemoved'].length > 0 && JSON.parse(window.localStorage['convalideRemoved']).length > 0){
                window.localStorage['convalideRemoved'] = [];
                var tmp = JSON.stringify(Cache.convalideCacheAll);
                Cache.convalideCache = JSON.parse(tmp);
                NavBadges.setBadges('convalide', Cache.convalideCache['pending'].length);
            }

        },

        delete: function(convalida, type){

            Cache.convalideCache[type].splice(Cache.convalideCache[type].indexOf(convalida), 1);

            var removed = (window.localStorage['convalideRemoved'] !== undefined && window.localStorage['convalideRemoved'].length > 0 && JSON.parse(window.localStorage['convalideRemoved']).length > 0) ? JSON.parse(window.localStorage['convalideRemoved']) : [];

            if(removed.indexOf(convalida.id) == -1){
                removed.push(convalida.id);
                window.localStorage['convalideRemoved'] = JSON.stringify(removed);
            }

            this.count();

        },

        move: function(convalida,approved){

            var deferred = $q.defer();

            var operation = approved ? 'accept' : 'reject';
            var urlApi = ApiConfig.ovpEndpoint+'convalide/'+window.localStorage['id_scheda']+'/'+convalida.type+'/'+operation+'/'+convalida.id+'/fields';
            var param = [];
            param[ApiConfig.wsKey] = 'JSON_CALLBACK';
            param['nocache'] = new Date().getTime();

            return $http({
                        method: 'JSONP',
                        url: urlApi,
                        params: param,
                        cache: false
                    })
                    .success(function(data, status, headers, config){

                        Cache.convalideCache.pending.splice(Cache.convalideCache.pending.indexOf(convalida), 1);
                        Cache.convalideCacheAll.pending.splice(Cache.convalideCacheAll.pending.indexOf(convalida), 1);

                        convalida.stato = data.stato;

                        Cache.convalideCache.approved.unshift(convalida);
                        Cache.convalideCacheAll.approved.unshift(convalida);

                        NavBadges.setBadges('convalide', Cache.convalideCache['pending'].length);

                        $cordovaToast.show(data.data,'long','bottom');

                        return deferred.resolve();

                    })
                    .error(function(data, status){
                        $cordovaToast.show(data.data,'long','bottom');
                        return deferred.reject();
                    });

        },

        addConvalida: function(convalide){

            return this.refreshList();

        }
    }

});