angular.module('eventi.controllers', [])

.controller('EventiCtrl', function($scope, $ionicPopup, $ionicLoading, $cordovaToast, $location, $timeout, Eventi) {

	$scope.eventi_list = [];
	$scope.isAvailable = true;

	$scope.loadEventi = function(){
		Eventi.loadMore().then(function(response){
			$scope.eventi_list = response;
			$scope.isAvailable = Eventi.getMoreStatus();
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}, function(error){
			$cordovaToast.show('Attenzione! Si è verificato un errore durante il caricamento','short','bottom');
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};

    $scope.delete = function(evento){
    	
    	var tpl_remove = 'Sei sicuro di voler cancellare l\'evento?';
    	if(evento.twitter){
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
            	
            	Eventi.delete(evento)
            		.then(function(response){
            			$ionicLoading.hide();
            			$cordovaToast.show('Evento eliminato con successo','short','bottom');
            		}, function(error){
            			$ionicLoading.hide();
            			$cordovaToast.show('Errore eliminazione evento','short','bottom');
            		});
            }
        });

    }
    
    $scope.edit = function(id){
    	$location.path("/app/eventi/"+id+"/edit");
    }
    
    $scope.refresh = function(){
    	Eventi.refreshList().then(function(response){
			$scope.eventi_list = response;
			$scope.isAvailable = Eventi.getMoreStatus();
			$scope.$broadcast('scroll.refreshComplete');
		}, function(error){
			$cordovaToast.show('Errore nel recupero degli eventi!','short','bottom');
			$scope.$broadcast('scroll.refreshComplete');
		});

    };

})

.controller('EventiDetailCtrl', function($scope, $stateParams, $ionicHistory, $ionicPopup, $ionicLoading, $cordovaToast, Eventi) {
	
	$scope.eventi_list = Eventi.getList();
	
	$scope.evento = Eventi.get($stateParams.id);
	    
    $scope.delete = function(evento){
    	
    	var tpl_remove = 'Sei sicuro di voler cancellare l\'evento?';
    	if(evento.twitter){
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
            	
            	Eventi.delete(evento)
            		.then(function(response){
            			$ionicLoading.hide();
            			$ionicHistory.goBack();
            			$cordovaToast.show('Evento eliminato con successo','short','bottom');
            		}, function(error){
            			$ionicLoading.hide();
            			$cordovaToast.show('Errore eliminazione evento','short','bottom');
            		});
            }
        });

    }
    
})

.controller('EventiOperationCtrl', function($scope, $stateParams, $cordovaDatePicker, $cordovaCamera, $ionicLoading, $cordovaToast, $ionicPopup, $ionicHistory, $timeout, Auth, Eventi, ListeContatti) {
	
	var userData = Auth.getUserData(null);
	
	$scope.social = userData.wmc_data.social;
	
	$scope.notifiche = {messaggi:userData.wmc_data.messaggi, app:userData.wmc_data.app};
	$scope.notifiche_checkbox = {email:0, sms:0};
	
	$scope.emptyListaContatti = {email_disabled:false, sms_disabled:false};
	
	var currentView = $ionicHistory.currentView();
	var formDirty = false;
	
	switch(currentView.stateName){
		case 'app.eventi-create':
			$scope.evento = [];
			$scope.evento.twitter = false;
			$scope.evento.data_inizio_evento = new Date().getTime();

			var domani = new Date();
			domani.setDate(domani.getDate()+1);
			$scope.evento.data_fine_evento =  domani.getTime();
			
			$scope.evento.filename = userData.filename.replace('/lg_','/xl_');//'http://files.overplace.com/eventi/xl_overplace.png';
			$scope.evento.notifiche = {pendenti:{email:0}};
			break;
		case 'app.eventi-edit':
			$scope.evento = Eventi.get($stateParams.id);
			var originalEvento = angular.copy($scope.evento);
			break;
	}
	
    $scope.changeDate = function(type){    	
    	    	
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
    	
    	if(type == 'fine'){
    		var inizio = new Date($scope.evento.data_inizio_evento);
    		if(inizio.toDateString() >= new Date().toDateString()){
    			var fine = new Date($scope.evento.data_inizio_evento);
    			fine.setDate(fine.getDate()+1);
    			options_datepicker.minDate = (ionic.Platform.isAndroid()) ? new Date(fine).getTime() : new Date(fine);
    		}else{
    			options_datepicker.minDate = (ionic.Platform.isAndroid()) ? new Date().getTime() : new Date();
    		}
    	}
    	
    	if(!$scope.evento.notifiche.pendenti.email){
	    	$cordovaDatePicker.show(options_datepicker).then(function(date){
	        	$scope.evento['data_'+type+'_evento'] = date;
	        	formDirty = true;
	        	$scope.eventoForm.$dirty = true;
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
    	
    	Eventi.useCamera(options_camera)
    		.then(function(response){
    			$scope.evento.filename = response;
    			formDirty = true;
    			$scope.eventoForm.$dirty = true;
    		}, function(error){
    			$scope.eventoForm.$dirty = formDirty;
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
    	
    	Eventi.useCamera(options_photolibrary)
	    	.then(function(response){
	            $scope.evento.filename = response;
	            formDirty = true;
	            $scope.eventoForm.$dirty = true;
	        }, function(error){ 
	        	$scope.eventoForm.$dirty = formDirty;
	        });
    };
    
    $scope.removePhoto = function(){
    	
    	$timeout(function() {
        	$scope.evento.filename = userData.filename.replace('/lg_','/xl_');//'http://files.overplace.com/eventi/xl_overplace.png';
        	
        	formDirty = true;
            $scope.eventoForm.$dirty = true;
        }, 0);
    	
    };
    
    $scope.isEqual = function(){
    	var eq = angular.equals(originalEvento, angular.copy($scope.evento));
    	
    	formDirty = !eq;
        $scope.eventoForm.$dirty = formDirty;
        
    	return eq;
    };
    
    $scope.create = function(evento){
    	
		var data_inizio_evento = new Date(evento.data_inizio_evento);
		data_inizio_evento.setSeconds(0);
		data_inizio_evento.setMilliseconds(0);
		
    	var data_fine_evento = new Date(evento.data_fine_evento);
    	data_fine_evento.setSeconds(0);
    	data_fine_evento.setMilliseconds(0);
    	
    	if(data_inizio_evento.getTime() >= data_fine_evento.getTime()){
    		
    		$ionicPopup.alert({
				title: 'Attenzione',
				template: 'La data in cui termina l&apos;evento non pu&ograve; essere uguale o precendete al suo inizio!'
			});
    		
    		return false;
    	}
    	
		$ionicLoading.show({
        	template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });
		
        Eventi.create(evento)
    		.then(function(response){
    	        $scope.eventoForm.$dirty = false;
    			$ionicLoading.hide();
    			$ionicHistory.goBack(-2);
    			$cordovaToast.show('Evento creato con successo','short','bottom');
    		}, function(error){
    			$ionicLoading.hide();
    			$cordovaToast.show('Errore creazione evento','short','bottom');
    		});
        
    };
    
    $scope.update = function(evento){
        
    	var data_inizio_evento = new Date(evento.data_inizio_evento);
		data_inizio_evento.setSeconds(0);
		data_inizio_evento.setMilliseconds(0);
		
    	var data_fine_evento = new Date(evento.data_fine_evento);
    	data_fine_evento.setSeconds(0);
    	data_fine_evento.setMilliseconds(0);
    	
    	if(data_inizio_evento.getTime() >= data_fine_evento.getTime()){
    		
    		$ionicPopup.alert({
				title: 'Attenzione',
				template: 'La data in cui termina l&apos;evento non pu&ograve; essere uguale o precendete al suo inizio!'
			});
    		
    		return false;
    	}
    	
		$ionicLoading.show({
        	template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });

		changeImage = (evento.filename != originalEvento.filename) ? true : false;
		
        Eventi.update(evento,changeImage)
    		.then(function(response){
    	        $scope.eventoForm.$dirty = false;
    			$ionicLoading.hide();
    			$ionicHistory.goBack(-2);
    			$cordovaToast.show('Evento modificato con successo','short','bottom');
    		}, function(error){
    			$ionicLoading.hide();
    			$cordovaToast.show('Errore modifica evento','short','bottom');
    		});
        
    };
    
});