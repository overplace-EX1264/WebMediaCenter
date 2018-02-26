angular.module('starter.controllers', [])

.run(function($ionicPlatform, $cordovaPush, Database){
	var config = null,
		id_scheda;
	
	window.database = {
		_queue: [],
    	_flushQueue: function (){
    		if (window.database._queue.length > 0){
    			window.database.mSQLite.transaction(function (tx){
    				for (var i = 0; i < window.database._queue.length; i++){
    					if (typeof window.database._queue[i].sql == 'object'){
    						tx.executeSql(window.database._queue[i].sql.query, window.database._queue[i].sql.params, window.database._queue[i].callback);
    					}else {
    						tx.executeSql(window.database._queue[i].sql, [], window.database._queue[i].callback);	
    					}
    				}
    			}, function (e){  }, function (){ window.database._queue = new Array(); })
    		}
    	},
    	isReady: false,
    	isOpen: false,
    	mSQLite: null,
    	addQueue: function (q, c){
    		if ((typeof q != 'string' && typeof q != 'object') || typeof c !== "function"){ return false; }
    		if (typeof q == 'object' && (!q.hasOwnProperty('query') || !q.hasOwnProperty('params') || typeof q.query != 'string' || typeof q.params != 'array')){ return false; }
    		window.database._queue.push({sql: q, callback: c});
    		return (window.database._queue.length - 1);
    	},
    	getResult: function (id){
    		return (typeof window.database._results[id] != undefined) ? window.database._results[id] : null;
    	},
    	open: function (){
    		window.database.close();
    		Database.open("database.db", function (db){
    			window.database.isOpen = true;
        		window.database.mSQLite = db;
        		
        		var query = "CREATE TABLE IF NOT EXISTS auth (" +
    						"'id' INT(11) NOT NULL, " +
    						"'id_scheda' INT(11) NULL," +
    						"'regid' VARCHAR(255) NULL," +
    						"'app_type' VARCHAR(50) NULL," +
    						"'app_version' VARCHAR(50) NULL," +
    						"'username' VARCHAR(255) NOT NULL," +
    						"'timestamp' INT(11) NOT NULL" +
    						");";
        		window.database.isReady = true;
        		db.transaction(function (tx){
        			tx.executeSql(query);
        		}, function (e){ 
        			
        		}, function (){
        			window.database._flushQueue();
        		});
        	});
    	},
    	close: function (){
    		if (window.database.isOpen){
    			window.database.mSQLite.close(function (){
    				window.database.isOpen = false;
    				window.database.mSQLite = null;
    			});
    		}else {
    			window.database.isOpen = false;
    			window.database.mSQLite = null;
    		}
    	}
    };
    window.database.open();
	
	if(ionic.Platform.isAndroid()){
        config = {'senderID':'41763066829'};
    }else if(ionic.Platform.isIOS()){
        config = {'badge':'true','sound':'true','alert':'true'};
    }

	id_scheda = window.localStorage.getItem('id_scheda');

    if(id_scheda !== null){
    	$ionicPlatform.ready(function(){
    		$cordovaPush.register(config)
    		    .then(function(result){
    			     // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
                    if(ionic.Platform.isIOS()){
                        regId = result;
                        window.localStorage['regId'] = regId;
                        if (!window.database.isOpen){
                        	window.database.addQueue({query: "UPDATE auth SET regid = ? WHERE id = 1;", params: [regId]}, function (tx, res){
                        		
                        	});
                        }else {
                        	window.database.mSQLite.transaction(function (tx){
                        		tx.executeSql("UPDATE auth SET regid = ? WHERE id = 1;", [regId], function (tx, res){
                        			
                        		});
                        	}, function (e){ 
                        		
                        	}, function (){
                        		
                        	});
                        }
                    }
    		    },function(err){
    			    alert('Errore di connessione');
    		    });
        });
    	
    }
})

.controller('AppCtrl', function($rootScope, $scope, $timeout, $state, $ionicLoading, $ionicPopup, $cordovaNetwork, $cordovaLocalNotification, $cordovaMedia, $cordovaVibration, $cordovaToast, $ionicHistory, $cordovaInAppBrowser, Auth, Database, PushState, Chats, Convalide, Notifiche, News, NavBadges){
	var coldStart = false;
    var id_scheda = window.localStorage.getItem('id_scheda');
       
    if(id_scheda !== null){
        Convalide.getList();
        Chats.init();
        
        Chats.all().then(
            function(chats) {
                $rootScope.NRchats = chats;
            }
        );
        
        ionic.Platform.ready(function(){
        	Auth.checkStatus(id_scheda)
        	.then(
    			function(response){
    				var user_obj = Auth.getUserData();
    				var new_info = false;
    				var trial_expired = false;
    				var d = new Date();
    				for(var key in response){
    					if(user_obj[key] === undefined || JSON.stringify(user_obj[key]) != JSON.stringify(response[key])){
    						new_info = true;
    					}
    				}
    				if((d.toISOString() >= response.data_scadenza_app && response.id_tipologia_versione_app == '3') || (response.app_scaduta == '1' && response.id_tipologia_versione_app == '3')){
    					var alertPopup = $ionicPopup.alert({
    						title: 'Attenzione',
    						template: 'La versione dell\'app è scaduta!'
    					});
    					
    					alertPopup.then(function(ok){
    						$ionicLoading.show({
    							template: '<ion-spinner></ion-spinner>',
    							noBackdrop: false
    						});
    						
    						Auth.logout()
    						.then(function(response){
    							Auth.changeAppVersion(id_scheda, 'base').then(function(){
    								$ionicHistory.clearCache();
    								$ionicHistory.clearHistory();
    								$ionicLoading.hide();
    								$state.go('login');
    							});
    						}, function(error){
    							$ionicLoading.hide();
    						});
    					});
    				} else if(new_info) {

    					Auth.storeAuthInfo(response);
    					Auth.clearCache();
    					$ionicHistory.clearHistory();
    					$ionicHistory.clearCache();
    					window.location.reload();
    				}
    			}, 
    			function(error){}
        	);
    	});
		
    }
        
    $rootScope.$watch("NRchats", function(value){
    	var nrBadge = 0;
		for(var i in value){
			if(value[i].toRead){
				if('#/app/chat/'+value[i].channelReference !== window.location.hash){
					nrBadge++;
				} else {
					value[i].toRead = false;
				}
			}
		}
    	NavBadges.setBadges('chat', nrBadge);
    },function(){});

    $rootScope.$on('$cordovaLocalNotification:click', function (event, notification, state){
        $state.go('app.chat');
    });

    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
        window.localStorage['network'] = 'online';
        Chats.init();
        Chats.all();
        $rootScope.$broadcast('reInitChat');
    });

    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
        window.localStorage['network'] = 'offline';
        $cordovaToast.show('Nessuna connessione dati','short','bottom');
    });

    $scope.notifications = [];

    // Notification Received
    $scope.$on('$cordovaPush:notificationReceived', function(event, notification){

  	    var h = $ionicHistory.viewHistory();
        var currentView = $ionicHistory.currentView();

        if(ionic.Platform.isAndroid()){
            if(notification.event == 'registered'){
            	if (!window.database.isOpen){
                	window.database.addQueue({query: "UPDATE auth SET regid = ? WHERE id = 1;", params: [notification.regid]}, function (tx, res){
                		
                	});
                }else {
                	window.database.mSQLite.transaction(function (tx){
                		tx.executeSql("UPDATE auth SET regid = ? WHERE id = 1;", [notification.regid], function (tx, res){
                			
                		});
                	}, function (e){ 
                		
                	}, function (){
                		
                	});
                }
            	
                PushState.handleAndroid(notification)
                    .then(function(response){
                        $ionicLoading.hide();
                        if($state.current.name !== 'home'){
                        	if(!coldStart){
                        		//$state.go('app.impostazioni', {}, {reload:true});
                        		$state.go('app.home');
                        	}
                        }
                    }, function(error){
                    	 $ionicLoading.hide();
                         Auth.clearStorage();
                         $cordovaToast.show('Impossibile completare il processo di autenticazione, riprova!','short','bottom');
                    });
            }else if(notification.event == 'message'){
                
            	var goto = '';
                if(notification.payload.custom.idRif !== undefined){
                    PushState.getFromRifId(notification.payload.custom.idRif)
                     .then(function(response){
                         response = PushState.getReference();
                        //nella notifica sono presenti chats
                        if(response.chats !== undefined && notification.foreground === false){
                            Chats.addChat(response.chats);
                            Chats.init();
                            Chats.all().then(
                                function(chats) {
                                    $rootScope.NRchats = chats;
                                }
                            );
                            if(goto == '') goto = 'app.chat';
                        }

                        //nella notifica sono presenti convalide
                        if(response.convalide !== undefined){
                        	Convalide.getList();
                            Convalide.addConvalida(response.convalide);
                            if(goto == '') goto = 'app.convalide';
                        }

                        if(response.notifiche !== undefined){
                            Notifiche.addNotifica(response.notifiche);
                             if(goto == '') goto = 'app.notifiche';
                        }
                        PushState.serverNotificationsCallback();
                        $ionicHistory.clearCache();
                        _goto();
                    });

                }else{
                	
                    //nella notifica sono presenti chats
                    if(notification.payload.custom.chats !== undefined && notification.foreground === false){
                        Chats.addChat(notification.payload.custom.chats);
                        Chats.all().then(
                            function(chats) {
                                $rootScope.NRchats = chats;
                            }
                        );
                        if(goto == '') goto = 'app.chat';
                    }

                    //nella notifica sono presenti convalide
                    if(notification.payload.custom.convalide !== undefined){
                       Convalide.getList();
                       Convalide.addConvalida(notification.payload.custom.convalide);
                        if(goto == '') goto = 'app.convalide';
                    }

                    if(notification.payload.custom.notifiche !== undefined){
                        Notifiche.addNotifica(notification.payload.custom.notifiche);
                        if(goto == '') goto = 'app.notifiche';
                    }

                    PushState.serverNotificationsCallback();
                    $ionicHistory.clearCache();
                    _goto();
                }
                
                function _goto(){
                	if(notification.foreground){
                		if(notification.payload.sound){
                			var media = $cordovaMedia.newMedia(cordova.file.applicationDirectory+'www/sound/notification.mp3');
                			media.setVolume(0.3);
                			media.play();
                		}
                		if(notification.payload.vibrate){
                			$cordovaVibration.vibrate(500);
                		}
                	} else {
                		if($state.current.name !== goto && goto !== ''){
                			coldStart = true;
                			$timeout(function(){
                				$ionicHistory.nextViewOptions({
                					disableBack : true
                				});
                				
            					$state.go(goto)
            				
                			});
                		}                
                	}
                }
            }else if(notification.event == 'error'){
            	$cordovaToast.show(notification.msg+' Push notification error event');
            }else{
            	$cordovaToast.show('Push notification handler - Unprocessed Event');
            }

        }else if(ionic.Platform.isIOS()){
        	PushState.handleIOS(notification);
            $ionicLoading.hide();
        }
    });
    
    $scope.openInBrowser = function(obj, type, target){
    	
    	var userData = Auth.getUserData(null);
    	
    	var box_ovp = '';
    	switch(type){
    		case 'news':
    			box_ovp = '#box-post';
    			break;
    		case 'evento':
    			box_ovp = '#box-eventi';
    			break;
    		case 'coupon':
    			box_ovp = '#box-coupon';
    			break;
    		case 'promozione':
    			box_ovp = '#box-offerte';
    			break;
    	}

    	if(target == 'overplace' && userData.url_vetrina !== undefined){
			$cordovaInAppBrowser.open(userData.url_vetrina+box_ovp, '_system');
		}else if(target == 'facebook' && userData.pagina_facebook !== undefined && obj.facebook == '1' && obj.id_post_facebook != ''){
			$cordovaInAppBrowser.open(userData.pagina_facebook+'/posts/'+obj.id_post_facebook, '_system');
		}else if(target == 'twitter' && userData.pagina_twitter !== undefined && obj.twitter == '1' && obj.id_post_twitter != ''){
			$cordovaInAppBrowser.open(userData.pagina_twitter + '/status/'+obj.id_post_twitter, '_system');
		}
		
	};
    
})

.controller('NavMenuCtrl', function($scope, $state, $cordovaToast, Auth, NavBadges) {

	var userData = Auth.getUserData(null);
	
    $scope.badges = NavBadges.getBadges();
    
    $scope.titolo = userData.titolo_scheda;
    $scope.chat_disabled = userData.wmc_data.chat == '0' ? true : false;
    $scope.showModuliInattivi = window.localStorage['showModuliInattivi'] == 'true';

    // 1 base, 2 premium, 3 trial
	var id_tipologia_versione_app = userData.id_tipologia_versione_app;

	switch (id_tipologia_versione_app){
		case '2':
			$scope.menu_version = "professional";

			$scope.menu_professional = [
				{ id:'home', name:'Home', link:'#/app/home', icon:'fa-home', type:'simple', section:0, order:0, active:true, visible:true },
				{ id:'notifiche', name:'Notifiche', link:'#/app/notifiche', icon:'fa-bell', type:'badge', section:1, order:1, active:true, visible:true },
				{ id:'convalide', name:'Convalide', link:'#/app/convalide', icon:'fa-check-circle', type:'badge', section:1, order:2, active:true, visible:true },
				{ id:'chat', name:'Chat', link:'#/app/chat', icon:'fa-comments', type:'badge', section:1, order:3, active:userData.wmc_data.chat, visible:true },
				{ id:'rubrica', name:'Rubrica', link:'#/app/rubrica', icon:'fa-users', type:'simple', section:1, order:4, active:true, visible:true },
				{ id:'news', name:'News', link:'#/app/news', icon:'fa-quote-left', type:'simple', section:1, order:5, active:true, visible:true },
				{ id:'youtube', name:'Youtube', link:'#/app/youtube', icon:'fa-youtube-play', type:'simple', section:1, order:5, active:true, visible:true },
				{ id:'eventi', name:'Eventi', link:'#/app/eventi', icon:'fa-bullhorn', type:'simple', section:1, order:6, active:true, visible:true },
				{ id:'promozioni', name:'Promozioni', link:'#/app/promozioni', icon:'fa-trophy', type:'simple', section:1, order:7, active:userData.wmc_data.promozioni, visible:true },
				{ id:'coupon', name:'Coupon', link:'#/app/coupon', icon:'fa-gavel', type:'simple', section:1, order:8, active:userData.wmc_data.coupon, visible:true },
				{ id:'recensioni', name: 'Recensioni', link:'#/app/recensioni', icon:'fa-commenting-o', type:'simple', section:1, order:9, active:true, visible:true },
				{ id:'gallery', name:'Gallery', link:'#/app/gallery', icon:'fa-picture-o', type:'simple', section:1, order:10, active:true, visible:true },
				{ id:'riepilogo', name:'Report', link:'#/app/riepilogo', icon:'fa-line-chart', type:'simple', section:1, order:11, active:true, visible:true },
				{ id:'help', name:'Help', link:'#/app/help', icon:'fa-question', type:'simple', section:2, order:0, active:true, visible:true },
				{ id:'contatti', name:'Contattaci', link:'#/app/contatti', icon:'fa-phone', type:'simple', section:2, order:1, active:true, visible:(Object.keys(userData.support).length > 0) }
			];
		break;
		case '3':
			$scope.menu_version = "trial";
			var isAppScaduta = (userData.app_scaduta == '1') ? true : false;
			$scope.data_scadenza_app = userData.data_scadenza_app;

			if (isAppScaduta){
				$scope.menu_version = "base";

				$scope.menu_base = [
					{ id:'home', name:'Home', link:'#/app/home', icon:'fa-home', type:'simple', section:0, order:0, active:true, visible:true },
					{ id:'notifiche', name:'Notifiche', link:'#/app/notifiche', icon:'fa-bell', type:'badge', section:1, order:1, active:true, visible:true },
					{ id:'convalide', name:'Convalide', link:'#/app/convalide', icon:'fa-check-circle', type:'badge', section:1, order:2, active:true, visible:true },
					{ id:'chat', name:'Chat', link:'#/app/chat', icon:'fa-comments', type:'badge', section:1, order:3, active:userData.wmc_data.chat, visible:true },
					{ id:'rubrica', name:'Rubrica', link:'#/app/rubrica', icon:'fa-users', type:'simple', section:1, order:4, active:true, visible:true },
					{ id:'contatti', name:'Contattaci', link:'#/app/contatti', icon:'fa-phone', type:'simple', section:2, order:1, active:true, visible:(Object.keys(userData.support).length > 0) },
					{ id:'professional', name:'Professional', link:'#/app/professional', icon:'fa-level-up', type:'simple', section:2, order:2, active:true, visible:true }
				];
			}else {
				$scope.menu_trial = {
					base: [
						{ id:'home', name:'Home', link:'#/app/home', icon:'fa-home', type:'simple', section:0, order:0, active:true, visible:true },
						{ id:'notifiche', name:'Notifiche', link:'#/app/notifiche', icon:'fa-bell', type:'badge', section:1, order:1, active:true, visible:true },
						{ id:'convalide', name:'Convalide', link:'#/app/convalide', icon:'fa-check-circle', type:'badge', section:1, order:2, active:true, visible:true },
						{ id:'chat', name:'Chat', link:'#/app/chat', icon:'fa-comments', type:'badge', section:1, order:3, active:userData.wmc_data.chat, visible:true },
						{ id:'rubrica', name:'Rubrica', link:'#/app/rubrica', icon:'fa-users', type:'simple', section:1, order:4, active:true, visible:true },
						{ id:'contatti', name:'Contattaci', link:'#/app/contatti', icon:'fa-phone', type:'simple', section:2, order:1, active:true, visible:(Object.keys(userData.support).length > 0) },
						{ id:'professional', name:'Professional', link:'#/app/professional', icon:'fa-level-up', type:'simple', section:2, order:2, active:true, visible:true }
					],
					professional: [
						{ id:'news', name:'News', link:'#/app/news', icon:'fa-quote-left', type:'simple', section:1, order:5, active:true, visible:true },
						{ id:'eventi', name:'Eventi', link:'#/app/eventi', icon:'fa-bullhorn', type:'simple', section:1, order:6, active:true, visible:true },
						{ id:'promozioni', name:'Promozioni', link:'#/app/promozioni', icon:'fa-trophy', type:'simple', section:1, order:7, active:userData.wmc_data.promozioni, visible:true },
						{ id:'coupon', name:'Coupon', link:'#/app/coupon', icon:'fa-gavel', type:'simple', section:1, order:8, active:userData.wmc_data.coupon, visible:true },
						{ id:'recensioni', name: 'Recensioni', link:'#/app/recensioni', icon:'fa-commenting-o', type:'simple', section:1, order:9, active:true, visible:true },
						{ id:'gallery', name:'Gallery', link:'#/app/gallery', icon:'fa-picture-o', type:'simple', section:1, order:10, active:true, visible:true },
						{ id:'riepilogo', name:'Report', link:'#/app/riepilogo', icon:'fa-line-chart', type:'simple', section:1, order:11, active:true, visible:true },
						{ id:'help', name:'Help', link:'#/app/help', icon:'fa-question', type:'simple', section:2, order:0, active:true, visible:true }
					]
				};
			}

		break;
		default:
			$scope.menu_version = "base";

			$scope.menu_base = [
				{ id:'home', name:'Home', link:'#/app/home', icon:'fa-home', type:'simple', section:0, order:0, active:true, visible:true },
				{ id:'notifiche', name:'Notifiche', link:'#/app/notifiche', icon:'fa-bell', type:'badge', section:1, order:1, active:true, visible:true },
				{ id:'convalide', name:'Convalide', link:'#/app/convalide', icon:'fa-check-circle', type:'badge', section:1, order:2, active:true, visible:true },
				{ id:'chat', name:'Chat', link:'#/app/chat', icon:'fa-comments', type:'badge', section:1, order:3, active:userData.wmc_data.chat, visible:true },
				{ id:'rubrica', name:'Rubrica', link:'#/app/rubrica', icon:'fa-users', type:'simple', section:1, order:4, active:true, visible:true },
				{ id:'contatti', name:'Contattaci', link:'#/app/contatti', icon:'fa-phone', type:'simple', section:2, order:1, active:true, visible:(Object.keys(userData.support).length > 0) },
				{ id:'professional', name:'Professional', link:'#/app/professional', icon:'fa-level-up', type:'simple', section:2, order:2, active:true, visible:true }
			];
		break;
	}


    $scope.showModuliChange = function(){
    	$scope.showModuliInattivi = $scope.showModuliInattivi == true ? false : true;
    	var statoModuli = $scope.showModuliInattivi == true ? 'Moduli ripristinati' : 'Moduli nascosti';
    	window.localStorage['showModuliInattivi'] = $scope.showModuliInattivi;
    	$cordovaToast.show(statoModuli,'short','bottom');
    };
    
})

.controller('HomeCtrl', function($scope, $state, $ionicLoading, $ionicHistory, $cordovaNetwork, $cordovaToast, Auth, Database, PushState, Chats, NavBadges) {

	var userData = Auth.getUserData(null);
	
    $scope.badges = NavBadges.getBadges();

    $scope.titolo = userData.titolo_scheda;
    $scope.username = userData.nome_utente;
    $scope.filename = userData.filepath;
    $scope.chat_disabled = userData.wmc_data.chat == '0' ? true : false;
    
    $scope.menu_home_list = [
		{ id:'notifiche', name:'Notifiche', link:'#/app/notifiche', icon:'fa-bell', type:'badge', section:1, order:1, active:true, visible:true },
		{ id:'convalide', name:'Convalide', link:'#/app/convalide', icon:'fa-check-circle', type:'badge', section:1, order:2, active:true, visible:true },
		{ id:'chat', name:'Chat', link:'#/app/chat', icon:'fa-comments', type:'badge', section:1, order:3, active:userData.wmc_data.chat, visible:true }
    ];
    
    $scope.settings = {
        enablePushNotifications: window.localStorage['enablePushNotifications'] === 'true' ? true : false,
        chatAvailable : window.localStorage['chatAvailable'] === 'false' ? false : true,
    };

    $scope.chatAvailableChange = function(){
    	PushState.toggleChat($scope.settings.chatAvailable)
    		.then(function(response){
    			window.localStorage['chatAvailable'] = $scope.settings.chatAvailable;
    			var statoChat = $scope.settings.chatAvailable === true ? 'Chat attivata' : 'Chat disattivata';
    			$cordovaToast.show(statoChat,'short','bottom');
    			if($scope.settings.chatAvailable === false){
    				Chats.breakChat();
    			} else {
    				Chats.init();
    				Chats.all();
    				$ionicHistory.clearCache();
    				$ionicHistory.clearHistory();
    			}
    		}, function(error){
    			$cordovaToast.show('Errore cambio stato Chat','short','bottom');
    		})
    };

    $scope.pushNotificationChange = function(){

        if($scope.settings.enablePushNotifications){
            var data = {id_scheda: window.localStorage['id_scheda']};

            PushState.register(data)
                .then(function(response){
                    $scope.settings.enablePushNotifications = true;
                    $cordovaToast.show('Notifiche attivate','short','bottom');
                }, function(error){
                    $scope.settings.enablePushNotifications = false;
                    $cordovaToast.show('Errore attivazione notifiche','short','bottom');
                });

        }else{

            PushState.unregister()
                .then(function(response){
                    $scope.settings.enablePushNotifications = false;
                    $cordovaToast.show('Notifiche disattivate','short','bottom');
                }, function(error){
                    $scope.settings.enablePushNotifications = true;
                    $cordovaToast.show('Errore disattivazione notifiche','short','bottom');
                });

        }

        window.localStorage['enablePushNotifications'] = $scope.settings.enablePushNotifications;

    };

    $scope.logout_disabled = (window.localStorage['network'] == 'online') ? false : true;

    $scope.$watch(function(){
        return window.localStorage['network'];
    },function(newVal,oldVal){
        if(newVal !== undefined && newVal != oldVal){
            $scope.logout_disabled = (newVal == 'online') ? false : true;
        }
    });

    $scope.logout = function(){

        if($cordovaNetwork.isOffline()){
            $cordovaToast.show('Nessuna connessione dati','short','bottom');
            return false;
        }

        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });

        Auth.logout()
        .then(function(response){
        	if (!window.database.isReady){
        		window.database.addQueue("UPDATE OR IGNORE auth SET regid = NULL, id_scheda = NULL WHERE id = 1;", function (tx, res){});
        	}else {
        		window.database.mSQLite.transaction(function (tx){
        			tx.executeSql("UPDATE OR IGNORE auth SET regid = NULL, id_scheda = NULL WHERE id = 1;");
        		}, function (e){ 
        			
        		}, function (){
        			
        		});
        	}
            $ionicLoading.hide();
            $state.go('login');
            $ionicHistory.clearCache();
			$ionicHistory.clearHistory();
        }, function(error){
            $ionicLoading.hide();
        });

    };

})

.controller('LoginCtrl', function($scope, $rootScope, $state, $ionicLoading, $cordovaNetwork, $cordovaToast, Auth, Database, Convalide, Chats, NavBadges) {
	
	$scope.credentials = {username: '', password: '', remember: false};
    $scope.auth_error = null;
    $scope.submitted = false;
    $scope.login_disabled = false;
    $scope.rememberAvailability = false;
    var query = "SELECT id, id_scheda, regid, app_type, app_version, username, timestamp FROM auth LIMIT 0,1;";
		
    if (!window.database.isReady){
    	window.database.addQueue(query, function (tx, res){
    		$scope.rememberAvailability = true;
    		if (res.rows.length > 0){
    			var now = new Date().getTime();
    			if (res.rows.item(0).regid != null && res.rows.item(0).timestamp > now){
    				window.localStorage['regid'] = res.rows.item(0).regid;
    				window.localStorage['id_scheda'] = res.rows.item(0).id_scheda;
    				window.localStorage['APP_VERSION'] = res.rows.item(0).app_version;
    				$state.go('/app/home');
    			}else {
    				$scope.credentials.username = res.rows.item(0).username;
    				$scope.credentials.remember = true;
    			}
    		}
    	});
    }else {
    	window.database.mSQLite.executeSql(query, [], function (res){
    		$scope.rememberAvailability = true;
    		if (res.rows.length > 0){
    			var now = new Date().getTime();
    			if (res.rows.item(0).regid != null && res.rows.item(0).timestamp > now){
    				window.localStorage['regid'] = res.rows.item(0).regid;
    				window.localStorage['id_scheda'] = res.rows.item(0).id_scheda;
    				window.localStorage['APP_VERSION'] = res.rows.item(0).app_version;
    				$state.go('/app/home');
    			}else {
    				$scope.credentials.username = res.rows.item(0).username;
    				$scope.credentials.remember = true;
    			}
    		}
    	});
    }
    
    $scope.$watch(function(){
        return window.localStorage['network'];
    },function(newVal,oldVal){
        if(newVal !== undefined && newVal != oldVal){
            $scope.login_disabled = (newVal == 'online') ? false : true;
        }
    });
    
    $scope.login = function(){
        if(this.loginForm.$valid){

            if(cordova.plugins.Keyboard.isVisible) cordova.plugins.Keyboard.close();

            window.localStorage['network'] = $cordovaNetwork.isOnline() ? 'online' : 'offline';

            if($cordovaNetwork.isOffline()){
                $cordovaToast.show('Nessuna connessione dati','short','bottom');
                return false;
            }

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>',
                noBackdrop: false
            });

            Auth.login($scope.credentials.username, $scope.credentials.password)
                .then(function(response){
                    $scope.auth_error = false;
                    Auth.storeAuthInfo(response.data);
                    Convalide.refreshList();
                    Chats.init();
                    Chats.all().then(
                        function(chats) {
                            $rootScope.NRchats = chats;
                        }
                    );
                    query = "DELETE FROM auth;";
                    
                    if (!window.database.isReady){
                    	window.database.addQueue(query, function (tx, res){
                    		if ($scope.credentials.remember){
                    			var timestamp = new Date().getTime() + 2592000000; //30 giorni in più
                        		query = "INSERT INTO auth (id, id_scheda, regid, app_type, app_version, username, timestamp) VALUES (?, ?, NULL, ?, ?, ?, ?);";
                        		tx.executeSql(query, ["1", response.data.id_scheda, "WebMediaCenter", "2", $scope.credentials.username, timestamp]);	
                    		}
                    	});
                    }else {
                    	window.database.mSQLite.transaction(function (tx){
                    		tx.executeSql(query);
                    		if ($scope.credentials.remember){
                    			var timestamp = new Date().getTime() + 2592000000; //30 giorni in più
                        		query = "INSERT INTO auth (id, id_scheda, regid, app_type, app_version, username, timestamp) VALUES (?, ?, NULL, ?, ?, ?, ?);";
                        		tx.executeSql(query, ["1", response.data.id_scheda, "WebMediaCenter", "2", $scope.credentials.username, timestamp]);	
                    		}
                    	}, function (e){  }, function (){  })
                    }
                }, function(error){
                    $scope.auth_error = true;
                    $ionicLoading.hide();
                    $cordovaToast.show('Indirizzo email o password errati','short','center');
                });

        }else{
        	this.loginForm.submitted = true;
        }
    };

})

.controller('ContattiCtrl', function($scope, Auth){
	
	var userData_support = Auth.getUserData('support');
	
	$scope.isSupport = Object.keys(userData_support).length > 0;
	if($scope.isSupport){
		$scope.support_phone = (userData_support.phone !== undefined && userData_support.phone !== null && userData_support.phone.length > 0) ? userData_support.phone : null;
		$scope.support_email = (userData_support.email !== undefined && userData_support.email !== null && userData_support.email.length > 0) ? userData_support.email : null;
		$scope.support_description = (userData_support.description !== undefined && userData_support.description !== null && userData_support.description.length > 0) ? userData_support.description : null;
		$scope.support_filename = (userData_support.filename !== undefined && userData_support.filename !== null && userData_support.filename.length > 0) ? userData_support.filename : null;
	}

});