angular.module('news.controllers', [])

.controller('NewsCtrl', function($scope, $ionicPopup, $ionicLoading, $cordovaToast, $location, News, $timeout) {

	$scope.news_list = [];
	$scope.isAvailable = true;

	$scope.loadNews = function(){
		News.loadMore().then(function(response){
			$scope.news_list = response;
			$scope.isAvailable = News.getMoreStatus();
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}, function(error){
			$cordovaToast.show('Attenzione! Si è verificato un errore durante il caricamento','short','bottom');
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};
	
    $scope.delete = function(news){
    	
    	var tpl_remove = 'Sei sicuro di voler cancellare la news?';
    	if(news.facebook && news.twitter){
    		tpl_remove+= ' Verranno eliminati anche i post su Facebook e Twitter.';
    	}else if(news.facebook){
    		tpl_remove+= ' Verrà eliminato anche il post su Facebook.';
    	}else if(news.twitter){
    		tpl_remove+= ' Verrà eliminato anche il post su Twitter.';
    	}
    
    	var confirmPopup = $ionicPopup.confirm({
			title: 'Attenzione',
            template: tpl_remove,
            okText: 'Si',
            cancelText : 'No'
        });
        confirmPopup.then(function(ok){
            if(ok){
            	$ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>',
                    noBackdrop: false
                });
            	
            	News.delete(news)
            		.then(function(response){
            			$ionicLoading.hide();
            			$cordovaToast.show('News eliminata con successo','short','bottom');
            		}, function(error){
            			$ionicLoading.hide();
            			$cordovaToast.show('Errore eliminazione news','short','bottom');
            		});
            }
        });

    }
    
    $scope.edit = function(id){
    	$location.path("/app/news/"+id+"/edit");
    }
    
    $scope.refresh = function(){
    	News.refreshList().then(function(response){
			$scope.news_list = response;
			$scope.isAvailable = News.getMoreStatus();
			$scope.$broadcast('scroll.refreshComplete');
		}, function(error){
			$cordovaToast.show('Errore nel recupero delle news!','short','bottom');
			$scope.$broadcast('scroll.refreshComplete');
		});

    };

})

.controller('NewsDetailCtrl', function($scope, $stateParams, $ionicHistory, $ionicPopup, $ionicLoading, $cordovaToast, News) {
		
	$scope.news_list = News.getList();
	
	$scope.news = News.get($stateParams.id);
	    
    $scope.delete = function(news){
    	
    	var tpl_remove = 'Sei sicuro di voler cancellare la news?';
    	if(news.facebook && news.twitter){
    		tpl_remove+= ' Verranno eliminati anche i post su Facebook e Twitter.';
    	}else if(news.facebook){
    		tpl_remove+= ' Verrà eliminato anche i post su Facebook.';
    	}else if(news.twitter){
    		tpl_remove+= ' Verrà eliminato anche i post su Twitter.';
    	}
        
    	var confirmPopup = $ionicPopup.confirm({
			title: 'Attenzione',
            template: tpl_remove,
            okText: 'Si',
            cancelText : 'No'
        });
        confirmPopup.then(function(ok){
            if(ok){
            	$ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>',
                    noBackdrop: false
                });
            	
            	News.delete(news)
            		.then(function(response){
            			$ionicLoading.hide();
            			$ionicHistory.goBack();
            			$cordovaToast.show('News eliminata con successo','short','bottom');
            		}, function(error){
            			$ionicLoading.hide();
            			$cordovaToast.show('Errore eliminazione news','short','bottom');
            		});
            }
        });

    }
    
})

.controller('NewsOperationCtrl', function($scope, $stateParams, $cordovaDatePicker, $cordovaCamera, $ionicLoading, $cordovaToast, $ionicPopup, $ionicHistory, $timeout, $cordovaSocialSharing, Auth, News, ListeContatti) {
	
	var userData = Auth.getUserData(null);
	
	$scope.social = userData.wmc_data.social;
	
	$scope.notifiche = {messaggi:userData.wmc_data.messaggi, app:userData.wmc_data.app};
	$scope.notifiche_checkbox = {email:0, sms:0};
	
	$scope.emptyListaContatti = {email_disabled:false, sms_disabled:false};
	
	var currentView = $ionicHistory.currentView();
	var formDirty = false;
	
	switch(currentView.stateName){
		case 'app.news-create':
			$scope.news = [];
			$scope.news.facebook = false;
			$scope.news.twitter = false;
			$scope.news.linkedin = false;
			$scope.news.data_inizio_pubblicazione = new Date().getTime();
			$scope.news.filename = 'http://files.overplace.com/bacheca/xl_overplace.png';
			$scope.news.notifiche = {pendenti:{email:0}};
			break;
		case 'app.news-edit':
			$scope.news = News.get($stateParams.id);			
			var originalNews = angular.copy($scope.news);
			break;
	}
	
    $scope.changeDate = function(){    
    	    	
    	var options_datepicker = {
	    	date: new Date(),
	    	mode: 'datetime',
	    	minDate: (ionic.Platform.isAndroid()) ? new Date().getTime() : new Date(),
	    	allowOldDates: false,
	    	is24Hour: true,
	    	allowFutureDates: true,
	    	doneButtonLabel: 'OK',
	    	doneButtonColor: '#2ECC71',
	    	cancelButtonLabel: 'Annulla',
	    	cancelButtonColor: '#CC0000'
	    };
    	
    	if(!$scope.news.notifiche.pendenti.email){
    		$cordovaDatePicker.show(options_datepicker).then(function(date){
	        	$scope.news.data_inizio_pubblicazione = date;
	        	formDirty = true;
	        	$scope.newsForm.$dirty = true;
	        });
    	}
    	
    };
            
    $scope.takePhoto = function(){
    	
    	var options_camera = {
			quality: 100,
			correctOrientation: true,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 1000,
			targetHeight: 760,
			saveToPhotoAlbum: true
		};
    	
    	News.useCamera(options_camera)
    		.then(function(response){
    			$scope.news.filename = response;
    			formDirty = true;
    			$scope.newsForm.$dirty = true;
    		}, function(error){
    			$scope.newsForm.$dirty = formDirty;
    		});
    };
    
    $scope.getPhotoAlbum = function(){
    	
    	 var options_photolibrary = {
			quality: 100,
			correctOrientation: true,
			mediaType: Camera.MediaType.PICTURE,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 1000,
			targetHeight: 760
		};
    	
    	News.useCamera(options_photolibrary)
	    	.then(function(response){
	            $scope.news.filename = response;
	            formDirty = true;
	            $scope.newsForm.$dirty = true;
	        }, function(error){ 
	        	$scope.newsForm.$dirty = formDirty;
	        });
    };
    
    $scope.removePhoto = function(){
    	
    	$timeout(function() {
        	$scope.news.filename = 'http://files.overplace.com/bacheca/xl_overplace.png';
        	
        	formDirty = true;
            $scope.newsForm.$dirty = true;
        }, 0);
    	
    };
    
    $scope.isEqual = function(){
    	var eq = angular.equals(originalNews, angular.copy($scope.news));
    	
    	formDirty = !eq;
        $scope.newsForm.$dirty = formDirty;
        
    	return eq;
    };
    
    $scope.create = function(news){
        
		$ionicLoading.show({
        	template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });		
		
        News.create(news)
    		.then(function(response){
    	        $scope.newsForm.$dirty = false;
    			$ionicLoading.hide();
    			$ionicHistory.goBack();
    			$cordovaToast.show('News creata con successo','short','bottom');
    			var dataPubblicazione = new Date(response.data_inizio_pubblicazione).getTime(),
    				now = new Date().getTime();
    			
    			if (dataPubblicazione <= now){
    				//Check WhatsApp
    				window.plugins.socialsharing.canShareVia('whatsapp', 'msg', null, null, null, function (success){
    					$ionicPopup.confirm({
    						title: 'Condividi',
    			            template: 'Vuoi condividere la news su WhatsApp?',
    			            okText: 'Si',
    			            cancelText : 'No'
    			        }).then(function(ok){
    			            if (ok){
    			            	$cordovaSocialSharing
    		    		    		.shareViaWhatsApp(null, null, "https://www.overplace.com/landing/N" + userData.id_scheda + "-" + response.id)
    		    		    		.then(function (result){
    		    		    			//Success!
    		    		    		}, function (e){
    		    		    			//An error occurred. Show a message to the user
    		    		    		});
    			            }
    			        });
    				}, function (e){  });
    			}
    		}, function(error){
    			$ionicLoading.hide();
    			$cordovaToast.show('Errore creazione news','short','bottom');
    		});
    };
    
    $scope.update = function(news){
        
		$ionicLoading.show({
        	template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });

		changeImage = (news.filename != originalNews.filename) ? true : false;
		
        News.update(news,changeImage)
    		.then(function(response){
    	        $scope.newsForm.$dirty = false;
    			$ionicLoading.hide();
    			$ionicHistory.goBack(-2);
    			$cordovaToast.show('News modificata con successo','short','bottom');
    			
    			var dataPubblicazione = new Date(response.data_inizio_pubblicazione).getTime(),
				now = new Date().getTime();
			
				if (dataPubblicazione <= now){
					//Check WhatsApp
					window.plugins.socialsharing.canShareVia('whatsapp', 'msg', null, null, null, function (success){
						$ionicPopup.confirm({
							title: 'Condividi',
				            template: 'Vuoi condividere la news su WhatsApp?',
				            okText: 'Si',
				            cancelText : 'No'
				        }).then(function(ok){
				            if (ok){
				            	$cordovaSocialSharing
			    		    		.shareViaWhatsApp(null, null, "https://www.overplace.com/landing/N" + userData.id_scheda + "-" + response.id)
			    		    		.then(function (result){
			    		    			//Success!
			    		    		}, function (e){
			    		    			//An error occurred. Show a message to the user
			    		    		});
				            }
				        });
					}, function (e){  });
				}
    			
    		}, function(error){
    			$ionicLoading.hide();
    			$cordovaToast.show('Errore modifica news','short','bottom');
    		});
        
    };
    
});