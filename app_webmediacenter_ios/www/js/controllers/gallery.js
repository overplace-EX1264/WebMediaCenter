angular.module('gallery.controllers', [])

.controller('GalleryCtrl', function($scope, $rootScope, $state, $cordovaCamera, $ionicLoading, $cordovaToast, $ionicScrollDelegate, $timeout, $ionicPopup, $ionicHistory, Auth, Gallery) {
	
	var wmc_data = Auth.getUserData('wmc_data'),
		_filename = null;
	
	$scope.gallery = {
		filename : null,
		moduli_attivi : [{'id' : 'scheda', 'modulo' : 'Vetrina', 'checked' : false}],
		moduli_selezionati : []
	};
	
	$scope.formInvalid = true;
	
	$scope.create = function(gallery){
		
		$ionicLoading.show({
        	template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });
		
		Gallery.create(gallery)
		.then(function(response){
			_filename = $scope.gallery.filename;
 	        $scope.clearForm();
 			$ionicLoading.hide();
 			$cordovaToast.show('Immagine caricata con successo','short','bottom');
 			$ionicScrollDelegate.scrollTop(true);
 			Instagram.isInstalled(function (err, installed) {
			    if (installed){
			    	$ionicPopup.confirm({
						title: 'Condividi',
			            template: 'Vuoi condividere la foto su Instagram?',
			            okText: 'Si',
			            cancelText : 'No'
			        }).then(function(ok){
			            if (ok){ 
			            	Instagram.share(_filename, '', function (err){ _filename = null; }); 
			            }
			        });
			    }
			});
 		}, function(error){
 			$ionicLoading.hide();
 			$cordovaToast.show('Errore caricamento immagine','short','bottom');
 		});
     
	};
	
	$scope.selectModulo = function(modulo){
		if(modulo.checked){
			$scope.gallery.moduli_selezionati.push(modulo.id);
		} else {
			var index = $scope.gallery.moduli_selezionati.indexOf(modulo.id);
			if(index  > -1)$scope.gallery.moduli_selezionati.splice(index, 1);
		}
		
		$scope.formInvalid = $scope.gallery.moduli_selezionati.length == 0 || $scope.gallery.filename == null;
	};
	
	$rootScope.$on('$stateChangeStart', function(event, toState){
		if($scope.galleryForm.$dirty){
			 event.preventDefault();
             
             var confirmPopup = $ionicPopup.confirm({
     			title: 'Attenzione',
                 template: "I dati non salvati andranno persi. Continuare?",
                 okText: 'Si',
                 cancelText : 'No'
             });
             confirmPopup.then(function(ok){
             	if(ok){
             		$scope.clearForm();
             		$ionicHistory.nextViewOptions({disableBack : true});
             		$state.go(toState);                  
             	}else{
                    event.preventDefault();
             	}
             });
		}
	});
				
	for(var key in wmc_data.gallery){
		if(wmc_data.gallery[key]){
			switch(key){
				case 'prenotazioni':
					$scope.gallery.moduli_attivi.push({'id' : 'booking', 'modulo' : 'Modulo Prenotazioni', 'checked' : false});
					break;
				case 'booking':
					$scope.gallery.moduli_attivi.push({'id' : 'hotel', 'modulo' : 'Modulo Booking', 'checked' : false});
					break;
				case 'menu':
					$scope.gallery.moduli_attivi.push({'id' : 'menu', 'modulo' : 'Modulo Menu', 'checked' : false});
					break;
				case 'catalogo':
					$scope.gallery.moduli_attivi.push({'id' : 'catalogo', 'modulo' : 'Modulo Catalogo', 'checked' : false});
					break;
				case 'ricette':
					$scope.gallery.moduli_attivi.push({'id' : 'ricetta', 'modulo' : 'Modulo Ricetta', 'checked' : false});
					break;
				case 'storytelling':
					$scope.gallery.moduli_attivi.push({'id' : 'storytelling', 'modulo' : 'Modulo Storytelling', 'checked' : false});
					break;
			}
		}
	}
	
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
    	
    	Gallery.useCamera(options_camera)
    		.then(function(response){
    			setTimeout(() => {
					$ionicLoading.hide();	
					$scope.galleryForm.$dirty = true;
					$scope.gallery.filename = response;
					$scope.formInvalid = $scope.gallery.moduli_selezionati.length == 0;
				}, 100);  
    		}, function(error){
				// $scope.galleryForm.$dirty = formDirty;
				console.log(error);
				$ionicLoading.hide();
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
   	
   	 	Gallery.useCamera(options_photolibrary)
	    	.then(function(response){
	    		$scope.galleryForm.$dirty = true;
	    		$scope.gallery.filename = response;
	    		$scope.formInvalid = $scope.gallery.moduli_selezionati.length == 0;
	        }, function(error){
	        	
	        });
   };
   
   $scope.removePhoto = function(){
	   $ionicScrollDelegate.scrollTop(true);
	   $timeout(function() {
       		$scope.clearForm();
       		$scope.formInvalid = true;
	   }, 500);
   };
   
   $scope.clearForm = function(){
	   $scope.galleryForm.$dirty = false;
	   $scope.gallery.filename = null;
	   $scope.gallery.moduli_selezionati = [];
	   for(var i in $scope.gallery.moduli_attivi){
	   	   $scope.gallery.moduli_attivi[i].checked = false;
	   }
   }

});