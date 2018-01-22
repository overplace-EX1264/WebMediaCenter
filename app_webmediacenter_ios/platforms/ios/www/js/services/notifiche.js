angular.module('notifiche.services', [])

.factory('Notifiche', function($http, $q, NavBadges, Cache) {

    var _this = this;

    Cache.notificheCache = (window.localStorage['notifiche'] !== undefined && JSON.parse(window.localStorage['notifiche']).length > 0) ? JSON.parse(window.localStorage['notifiche']) : [];
    Cache.notificheCacheId = (window.localStorage['notificheId'] !== undefined && Object.keys(JSON.parse(window.localStorage['notificheId'])).length > 0) ? JSON.parse(window.localStorage['notificheId']) : {};
    Cache.notificheCacheRead = (window.localStorage['notificheRead'] !== undefined && Object.keys(JSON.parse(window.localStorage['notificheRead'])).length > 0) ? JSON.parse(window.localStorage['notificheRead']) : {};

    NavBadges.setBadges('notifiche',Object.keys(Cache.notificheCacheRead).length);

    return {

        getList: function(){
        	
            var list = Cache.notificheCache;
            list.reverse();

            return list;
        },

        get: function(id){

            var rs = Cache.notificheCacheId[id];
            if(Cache.notificheCacheRead.hasOwnProperty(id) != false){

                for(var i in Cache.notificheCache){
                    if(Cache.notificheCache[i]['id'] == id){
                        Cache.notificheCache[i]['isRead'] = true;
                        delete Cache.notificheCacheRead[id];
                        break;
                    }
                }

                window.localStorage['notificheRead'] = JSON.stringify(Cache.notificheCacheRead);
                window.localStorage['notifiche'] = JSON.stringify(Cache.notificheCache);

                NavBadges.setBadges('notifiche',Object.keys(Cache.notificheCacheRead).length);

            }

            return rs;
        },

        addNotifica: function(notifica){

            for(var i in notifica){
                var n = notifica[i]['customData'];
                var arr = {'id':n['id'], 'type':n['type'], 'titolo':n['titolo'], 'testo':n['testo'], 'isRead':false, 'testo_commento' : n['testo_commento']};
                if(Cache.notificheCacheId.hasOwnProperty(n['id']) == false){
                    Cache.notificheCache.unshift(arr);
                    Cache.notificheCacheId[n['id']] = n;
                    Cache.notificheCacheRead[n['id']] = true;
                }
            }

            window.localStorage['notifiche'] = JSON.stringify(Cache.notificheCache);
            window.localStorage['notificheId'] = JSON.stringify(Cache.notificheCacheId);
            window.localStorage['notificheRead'] = JSON.stringify(Cache.notificheCacheRead);

            NavBadges.setBadges('notifiche',Object.keys(Cache.notificheCacheRead).length);

        },

        delete: function(notifica){

            if(Cache.notificheCacheRead.hasOwnProperty(notifica['id']) != false){
                delete Cache.notificheCacheRead[notifica['id']];
                window.localStorage['notificheRead'] = JSON.stringify(Cache.notificheCacheRead);

                NavBadges.setBadges('notifiche',Object.keys(Cache.notificheCacheRead).length);
            }
            
            if(Cache.notificheCache.indexOf(notifica) != -1){
				Cache.notificheCache.splice(Cache.notificheCache.indexOf(notifica), 1);
				delete Cache.notificheCacheId[notifica['id']];
				
	            window.localStorage['notifiche'] = JSON.stringify(Cache.notificheCache);
			}

        }

    }

});