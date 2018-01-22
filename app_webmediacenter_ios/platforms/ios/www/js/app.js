// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
//
/*
var locale = true;
if (locale) {
    angular.module("ngCordova.plugins.network",[]).factory("$cordovaNetwork", function(){
        return {
            'isOnline' : function(){return true},
            'isOffline' : function(){return false},
        };
    });
    cordova = {
        file : {
            externalRootDirectory : 'D:\AndroidStudioProjects'
        }
    }
    window.localStorage['APP_VERSION'] = 2;
    window.localStorage['id_scheda'] = '9413';
    window.localStorage['network'] = 'online';
    window.localStorage['user'] = JSON.stringify({
		titolo_scheda: "Andrea Luricella",
		id_scheda: "9413",
		url_vetrina: "https://www.overplace.com/web-media-manager-lauricella-andrea",
		pagina_facebook: "https://facebook.com/598441896953719",
		pagina_twitter: "https://twitter.com/FrancescoOvp",
		sito_web: "http://",
		nickname: "Andrea Lauricella",
		avatar: "ovp/avatar_default.png",
		nome: " ",
		chat: "1",
		filename: "http://files.overplace.com/9413/lg_9413_20150121164406.jpg",
		nome_utente: "andrea.lauricella@overplace.com",
		id_tipologia_versione_app: "2",
		data_attivazione_app: "2015-08-30T22:00:00.000Z",
		data_scadenza_app: "2015-09-29T22:00:00.000Z",
		app_scaduta: "0",
		wmc_data: {
			promozioni: true,
			messaggi: true,
			social: {
				facebook: true,
				twitter: true
			},
			coupon: true,
			app: false,
			gallery: {
				prenotazioni: true,
				booking: true,
				menu: true,
				catalogo: true,
				ricette: true,
				storytelling: true
			},
			chat: true
		},
		support: {
			phone: "0742677099",
			email: "support@overplace.com"
		}
	});
    window.localStorage['enablePushNotifications'] = true;
    window.localStorage['chatAvailable'] = true;
    window.localStorage['showModuliInattivi'] = true;
    window.localStorage['regId'] = 'aaa';
}
*/

angular.module('starter',
		['ionic',
		 'starter.controllers', 'chat.controllers', 'news.controllers', 'convalide.controllers', 'notifiche.controllers', 'promozioni.controllers', 'eventi.controllers', 'coupon.controllers', 'help.controllers', 'recensioni.controllers', 'gallery.controllers', 'riepilogo.controllers', 'professional.controllers', 'rubrica.controllers',
		 'starter.services', 'database.services', 'chat.services', 'news.services', 'convalide.services', 'notifiche.services', 'promozioni.services', 'eventi.services', 'coupon.services', 'help.services', 'recensioni.services', 'gallery.services', 'riepilogo.services', 'professional.services', 'rubrica.services',
		 'starter.directive', 'starter.filter',
		 'ngCordova',
		 'pusher-angular',
		 'monospaced.elastic',
		 'afkl.lazyImage',
		 'unsavedChanges',
		 'hmac',
		 'ionic.wizard',
		 'ngIOS9UIWebViewPatch']
)

.run(function($rootScope, $ionicPlatform, $ionicHistory, $ionicPopup, $ionicLoading, $cordovaNetwork, $cordovaStatusbar, $timeout, $cordovaSplashscreen, $state, $location, Auth, Database){

	var arr_currentState = ['app.chat-read','app.convalide-read','app.notifiche-read','app.news-create','app.news-read','app.news-edit','app.eventi-create','app.eventi-read','app.eventi-edit', 'app.promozioni-edit', 'app.coupon-create', 'app.coupon-read','app.coupon-edit', 'app.help-detail', 'app.recensioni-detail', 'app.riepilogo-read'];
    var arr_backState = ['app.chat','app.convalide','app.notifiche','app.news','app.news','app.news-read|app.news','app.eventi','app.eventi','app.eventi-read|app.eventi', 'app.promozioni', 'app.coupon','app.coupon','app.coupon-read|app.coupon', 'app.help', 'app.recensioni', 'app.riepilogo'];

    var _preventNavigation = false;
    var _preventNavigationUrl = null;
    
    $ionicPlatform.ready(function(){
        
        $cordovaStatusbar.hide();
        $timeout(function(){
        	$cordovaSplashscreen.hide()
        },400);
        
        if(window.MobileAccessibility){
            window.MobileAccessibility.usePreferredTextZoom(false);
        }
        
        ionic.Platform.fullScreen();
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard){
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        
        window.localStorage['network'] = $cordovaNetwork.isOnline() ? 'online' : 'offline';
        window.runningBg = 0;

        document.addEventListener("pause", function(){
            window.runningBg = 1;
            window.database.close();
        }, false);

        document.addEventListener("resume", function(){
            window.runningBg = 0;
            window.database.open();
            var userData = Auth.getUserData(null);
            
            //id_tipologia_versione_app = [1->base,2->premium,3->trial]
            if((userData.id_scheda !== null) && (userData.id_tipologia_versione_app !== null)){
            	
            	var d = new Date();
            	if((userData.id_tipologia_versione_app == '3' && d.toISOString() >= userData.data_scadenza_app) || userData.app_scaduta == '1'){
            		
            		var alertPopup = $ionicPopup.alert({
            			title: 'Attenzione',
            			template: 'La versione dell\'app è scaduta!'
            		});

            		alertPopup.then(function(ok){
            			$ionicLoading.show({
            				template: '<ion-spinner></ion-spinner>',
            				noBackdrop: false
            			});
            			var id_scheda = window.localStorage['id_scheda'];
            			Auth.logout()
            				.then(function(response){
            					Auth.changeAppVersion(id_scheda, 'base').then(function(){
            						$ionicLoading.hide();
            						$state.go('login');
            						$ionicHistory.clearCache();
            						$ionicHistory.clearHistory();
            					});
            				}, function(error){
            					$ionicLoading.hide();
            				});
            		});
            	}
            	
            }
            
        }, false);
    });
    
    $ionicPlatform.registerBackButtonAction(function(e){

    	var h = $ionicHistory.viewHistory();
        var currentView = $ionicHistory.currentView();
        var backView = $ionicHistory.backView();
        
        var closeApp = false;
        
        var id_current = arr_currentState.indexOf(currentView.stateName);
                
        if(id_current !== -1){
        	var id_back = arr_backState[id_current];        	
        	if(id_back.indexOf('|') != -1){
        		var arr_id_back = id_back.split('|');
        		if(arr_id_back.indexOf(backView.stateName) != -1){
        			$ionicHistory.goBack();
        		}else{
        			closeApp = true;
        		}	
        	}else if(arr_backState[id_current] == backView.stateName){
        		$ionicHistory.goBack();
        	}else{
    			closeApp = true;
    		}
        }else{
			closeApp = true;
		}
        
        if(closeApp){
	        var confirmPopup = $ionicPopup.confirm({
	            title: 'Chiusura app',
	            template: 'Sei sicuro di voler uscire?',
	            okText: 'OK',
	            cancelText : 'Annulla'
	        });
	        confirmPopup.then(function(close){
	            if(close){
	            	if (window.database.isOpen){ window.database.close(); }
	            	ionic.Platform.exitApp();
	            }
	        });
        }

        e.preventDefault();
        return false;
    }, 101); // 1 more priority than back button

})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, $ionicConfigProvider, unsavedWarningsConfigProvider, APP_VERSION){
	$ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back').previousTitleText(false);
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|file|tel):/);
    
    $stateProvider
    
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })
    
    .state('app',{
    	url: '/app',
    	abstract: true,
    	templateUrl: 'templates/nav_menu.html',
    	controller: 'NavMenuCtrl',
    	cache: false
    })

    .state('app.notifiche', {
        url: '/notifiche',
        views: {
            'navContent': {
            	templateUrl: 'templates/notifiche/list.html',
            	controller: 'NotificheCtrl'
            }
        }
    })

    .state('app.notifiche-read', {
    	url: '/notifiche/:id',
    	views: {
            'navContent': {
            	templateUrl: 'templates/notifiche/read.html',
            	controller: 'NotificheDetailCtrl'
            }
        }
    })

    .state('app.chat', {
        url: '/chat',
        views: {
            'navContent': {
            	templateUrl: 'templates/chat/list.html',
            	controller: 'ChatCtrl'
            }
        }
    })

    .state('app.chat-read', {
        url: '/chat/:channelReference',
        views: {
            'navContent': {
            	templateUrl: 'templates/chat/read.html',
            	controller: 'ChatDetailCtrl'
            }
        }
    })

    .state('app.convalide', {
        url: '/convalide',
        views: {
            'navContent': {
            	templateUrl: 'templates/convalide/list.html',
            	controller: 'ConvalideCtrl'
            }
        },
        resolve: {
        	initial: function(Convalide){
        		return {
        			list: Convalide.getList(),
        			count: Convalide.getTotalCount()
        		}
        	}
        }
    })

    .state('app.convalide-read', {
        url: '/convalide/:type/:id',
        views: {
            'navContent': {
            	templateUrl: 'templates/convalide/read.html',
            	controller: 'ConvalideDetailCtrl'
            }
        }
    })
    
    .state('app.news', {
        url: '/news',
        views: {
            'navContent': {
            	templateUrl: 'templates/news/list.html',
            	controller: 'NewsCtrl'
            }
        }
    })
    
    .state('app.news-read', {
        url: '/news/{id:[0-9]*}',
        views: {
            'navContent': {
            	templateUrl: 'templates/news/read.html',
            	controller: 'NewsDetailCtrl'
            }
        }
    })
    
    .state('app.news-create', {
        url: '/news/create',
        views: {
            'navContent': {
            	templateUrl: 'templates/news/create.html',
            	controller: 'NewsOperationCtrl'
            }
        }
    })
    
    .state('app.news-edit', {
        url: '/news/{id:[0-9]*}/edit',
        views: {
            'navContent': {
            	templateUrl: 'templates/news/edit.html',
            	controller: 'NewsOperationCtrl'
            }
        }
    })
    
    .state('app.eventi', {
        url: '/eventi',
        views: {
            'navContent': {
            	templateUrl: 'templates/eventi/list.html',
            	controller: 'EventiCtrl'
            }
        }
    })
    
    .state('app.eventi-read', {
        url: '/eventi/{id:[0-9]*}',
        views: {
            'navContent': {
            	templateUrl: 'templates/eventi/read.html',
            	controller: 'EventiDetailCtrl'
            }
        }
    })
    
    .state('app.eventi-create', {
        url: '/eventi/create',
        views: {
            'navContent': {
            	templateUrl: 'templates/eventi/create.html',
            	controller: 'EventiOperationCtrl'
            }
        }
    })
    
    .state('app.eventi-edit', {
        url: '/eventi/{id:[0-9]*}/edit',
        views: {
            'navContent': {
            	templateUrl: 'templates/eventi/edit.html',
            	controller: 'EventiOperationCtrl'
            }
        }
    })
    
    .state('app.promozioni', {
        url: '/promozioni',
        views: {
            'navContent': {
            	templateUrl: 'templates/promozioni/list.html',
            	controller: 'PromozioniCtrl'
            }
        },
        resolve: {
        	initial: function(Promozioni){
        		return Promozioni.getList();
        	}
        }
    })
    
    .state('app.promozioni-edit', {
    	url: '/promozioni/{id:[0-9]*}/edit',
        views: {
            'navContent': {
            	templateUrl: 'templates/promozioni/edit.html',
            	controller: 'PromozioniOperationCtrl'
            }
        }
    })
    


    .state('app.coupon', {
        url: '/coupon',
        views: {
            'navContent': {
                templateUrl: 'templates/coupon/list.html',
                controller: 'CouponCtrl'
            }
        }
    })

    .state('app.coupon-read', {
		url: '/coupon/{id:[0-9]*}',
		views: {
			'navContent': {
				templateUrl: 'templates/coupon/read.html',
				controller: 'CouponDetailCtrl'
			}
		}
	})

	.state('app.coupon-create', {
		url: '/coupon/create',
		views: {
			'navContent': {
				templateUrl: 'templates/coupon/wizard.html',
				controller: 'CouponWizardCtrl'
			}
		}
	})

    .state('app.coupon-edit', {
		url: '/coupon/{id:[0-9]*}/edit',
		views: {
			'navContent': {
				templateUrl: 'templates/coupon/edit.html',
				controller: 'CouponOperationCtrl'
			}
		}
	})

	.state('app.gallery', {
		url: '/gallery',
		views: {
			'navContent': {
				templateUrl: 'templates/gallery/gallery.html',
				controller: 'GalleryCtrl'
			}
		}
	})
	.state('app.help', {
		url: '/help',
		views: {
			'navContent': {
				templateUrl: 'templates/help/list.html',
				controller: 'HelpCtrl'
			}
		}
	})

	.state('app.help-detail', {
		url: '/help/detail/:id',
		views: {
			'navContent': {
				templateUrl: 'templates/help/detail.html',
				controller: 'HelpDetailCtrl'
			}
		}
	})

	.state('app.recensioni', {
		url: '/recensioni',
		views: {
			'navContent': {
				templateUrl: 'templates/recensioni/list.html',
				controller: 'recensioniCtrl'
			}
		}
	})

	.state('app.recensioni-detail', {
		url: '/recensioni/:id',
		views: {
			'navContent': {
				templateUrl: 'templates/recensioni/detail.html',
				controller: 'recensioniDetailCtrl'
			}
		}
	})

	.state('app.riepilogo', {
		url: '/riepilogo',
		views: {
			'navContent': {
				templateUrl: 'templates/riepilogo/list.html',
				controller: 'RiepilogoCtrl'
			}
		}
	})

	.state('app.riepilogo-read', {
		url: '/riepilogo/:name',
		views: {
			'navContent': {
				templateUrl: 'templates/riepilogo/read.html',
				controller: 'RiepilogoDetailCtrl'
			}
		}
	})
	
	.state('app.contatti', {
		url: '/contatti',
		views: {
			'navContent': {
				templateUrl: 'templates/contatti.html',
				controller: 'ContattiCtrl'
			}
		}
	})

	.state('app.professional', {
		url: '/professional',
		views: {
			'navContent': {
				templateUrl: 'templates/professional/read.html',
				controller: 'ProfessionalCtrl'
			}
		}
	})
	
	.state('app.rubrica', {
		url: '/rubrica',
		views: {
			'navContent': {
				templateUrl: 'templates/rubrica/list.html',
				controller: 'RubricaCtrl'
			}
		}
	})

    .state('app.home', {
        url: '/home',
        views: {
            'navContent': {
            	templateUrl: 'templates/home.html',
            	controller: 'HomeCtrl'
            }
        }
    })

    unsavedWarningsConfigProvider.logEnabled = false;
    unsavedWarningsConfigProvider.useTranslateService = false;
    unsavedWarningsConfigProvider.routeEvent = ['$stateChangeStart'];
    unsavedWarningsConfigProvider.navigateMessage = 'I dati non salvati andranno persi. Continuare?';
        
    //verifica la versione dell'app
    var app_version = window.localStorage.getItem('APP_VERSION');
    if(app_version == null || app_version < APP_VERSION){
    	
    	window.localStorage.clear();
    	$urlRouterProvider.otherwise('/login');
    	
    }else{
    	
    	//estre id_scheda da localStorage
        var id_scheda = window.localStorage.getItem('id_scheda');
        var regId = window.localStorage.getItem('regId');
        
        if((id_scheda !== null) && (regId !== null)){
            $urlRouterProvider.otherwise('/app/home');
        }else{
            window.localStorage.clear();
            $urlRouterProvider.otherwise('/login');
        }
    	
    }
    
})