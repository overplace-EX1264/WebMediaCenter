angular.module("coupon.controllers", [])

.controller('CouponCtrl', function($scope, $ionicPopup, $ionicLoading, $cordovaToast, $location, $timeout, Auth, Coupon, Help){
	
	var userData = Auth.getUserData(null);

	$scope.moduloCoupon = userData.wmc_data.coupon;
	$scope.isSupport = Object.keys(userData.support).length > 0;
	
	if($scope.isSupport){
		$scope.support_phone = userData.support.phone;
	}

	if(!$scope.moduloCoupon){
		$scope.inactive = Help.getModulo('coupon');
	}else{
		$scope.coupon_list = [];
		$scope.isAvailable = true;
	}

	$scope.call = function(phone){
		window.location.href = 'tel:'+phone;
	};
		
	$scope.loadCoupon = function(){
		Coupon.loadMore().then(function(response){
			$scope.coupon_list = response;
			$scope.isAvailable = Coupon.getMoreStatus();
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}, function(error){
			$cordovaToast.show('Attenzione! Si è verificato un errore durante il caricamento','short','bottom');
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};
	
	$scope.delete = function(coupon){

		var tpl_remove = 'Sei sicuro di voler cancellare il coupon?';
		if(coupon.facebook && coupon.twitter){
			tpl_remove+= ' Verranno eliminati anche i post su Facebook e Twitter.';
		}else if(coupon.facebook){
			tpl_remove+= ' Verr� eliminato anche il post su Facebook.';
		}else if(coupon.twitter){
			tpl_remove+= ' Verr� eliminato anche il post su Twitter.';
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

				Coupon.delete(coupon)
					.then(function(response){
						$ionicLoading.hide();
						$cordovaToast.show('Coupon eliminato con successo','short','bottom');
					}, function(error){
						$ionicLoading.hide();
						$cordovaToast.show('Errore eliminazione coupon','short','bottom');
					});
			}
		});

	}

	$scope.edit = function(id){
		$location.path("/app/coupon/"+id+"/edit");
	}
	
	$scope.refresh = function(){
		Coupon.refreshList().then(function(response){
			$scope.coupon_list = response;
			$scope.isAvailable = Coupon.getMoreStatus();
			$scope.$broadcast('scroll.refreshComplete');
		}, function(error){
			$cordovaToast.show('Errore nel recupero dei coupon!','short','bottom');
			$scope.$broadcast('scroll.refreshComplete');
		});
	};


})

.controller('CouponDetailCtrl', function($scope, $stateParams, Coupon, $ionicPopup, $cordovaToast, $ionicHistory, $ionicLoading, $state, $timeout){

	$scope.coupon = Coupon.get($stateParams.id);
	
	$scope.delete = function(coupon){

		var tpl_remove = 'Sei sicuro di voler cancellare il coupon?';
		
		if((coupon.facebook !== undefined && coupon.facebook) && (coupon.twitter !== undefined && coupon.twitter)){
			tpl_remove+= ' Verranno eliminati anche i post su Facebook e Twitter.';
		}else if(coupon.facebook !== undefined && coupon.facebook){
			tpl_remove+= ' Verr� eliminato anche il post su Facebook.';
		}else if(coupon.twitter !== undefined &&coupon.twitter){
			tpl_remove+= ' Verr� eliminato anche il post su Twitter.';
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

				Coupon.delete(coupon).then(function(response){
						$ionicLoading.hide();
						$ionicHistory.clearCache();
						$cordovaToast.show('Coupon eliminato con successo','short','bottom');
						$timeout(function(){
							$state.go('app.coupon', {reload: true});
						});
					}, function(error){
						$ionicLoading.hide();
						$cordovaToast.show('Errore eliminazione coupon','short','bottom');
					});
			}
		});

	}
	
})

.controller('CouponWizardCtrl', function($rootScope, $scope, $cordovaDatePicker, $cordovaCamera, $cordovaToast, $ionicPopup, $ionicLoading, $ionicHistory, $timeout, Auth, Coupon){
	
	var userData = Auth.getUserData(null);
	
	$scope.social = userData.wmc_data.social;

	$scope.notifiche = {messaggi:userData.wmc_data.messaggi, app:userData.wmc_data.app};
    $scope.notifiche_checkbox = {email:0, sms:0};

    $scope.emptyListaContatti = {email_disabled: false, sms_disabled: false};

	$scope.isAvailableDate = false;
	var couponDirty = false;

	$scope.coupon = [];
	$scope.coupon.twitter = false;
	$scope.coupon.facebook = false;
	$scope.coupon.data_inizio_erogazione = new Date().getTime();
	$scope.coupon.durata_coupon = 2;
	$scope.coupon.data_fine_erogazione =  Coupon.scadenza_coupon($scope.coupon.data_inizio_erogazione, $scope.coupon.durata_coupon);
	$scope.coupon.filename = userData.filename.replace('/lg_','/xl_');
	$scope.coupon.notifiche = {pendenti:{email:0}};
	$scope.coupon.id_tipologia_stato = 3;
	
	
	$scope.$on('wizard:StepFailed', function(e, args) {

		if (args.index == 0){
			if (($scope.coupon.numero_coupon_erogabili == undefined || $scope.coupon.numero_coupon_erogabili.length == 0) && !$scope.coupon.coupon_illimitati){
				$ionicPopup.alert({
					title: 'Erogazione Coupon',
					template: 'Inserire un numero di quanti coupon possono essere erogati o scegliere l\'opzione illimitati'
				});

				return;
			}

			if ($scope.coupon.sconto == undefined || $scope.coupon.sconto.length == 0){
				$ionicPopup.alert({
					title: 'Valore Coupon',
					template: 'Inserire un valore'
				});

				return;
			}

			if (!$scope.isAvailableDate){

				$ionicLoading.show({
					template: '<ion-spinner></ion-spinner>',
					noBackdrop: false
				});

				Coupon.checkDate($scope.coupon.data_inizio_erogazione, $scope.coupon.data_fine_erogazione).then(function(response){
					$scope.isAvailableDate = response;
					$ionicLoading.hide();
					
					if (response){
						$rootScope.$broadcast("wizard:Next");
					}else {
						$ionicPopup.alert({
							title: 'Attenzione',
							template: 'Per le date selezionate &egrave; gi&agrave; presente un altro coupon!'
						});
					}
				}, function(error){
					$ionicLoading.hide();
					$cordovaToast.show('Errore date coupon','short','bottom');
				});

			}

		}else if (args.index == 1) {

			if ($scope.coupon.titolo == undefined || $scope.coupon.titolo.length == 0){
				$ionicPopup.alert({
					title: 'Titolo Coupon',
					template: 'Assegna un titolo'
				});

				return;
			}


            if ($scope.coupon.descrizione == undefined || $scope.coupon.descrizione.length == 0){
            	$ionicPopup.alert({
					title: 'Descrizione Coupon',
					template: 'Inserisci una descrizione'
				});

				return;
            }

            if($scope.coupon.condizioni_legali == undefined || $scope.coupon.condizioni_legali.length == 0){
            	$ionicPopup.alert({
					title: 'Condizioni Coupon',
					template: 'Specifica le condizioni di utilizzo'
				});

				return;
            }
		}
	});


	$scope.changeDate = function(){
    	
    	var now = new Date();
    	var today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    	
    	var options_datepicker = {
	    	date: new Date(),
	    	mode: 'date',
	    	minDate: (ionic.Platform.isAndroid()) ? today.getTime() : today,
	    	allowOldDates: false,
	    	is24Hour: true,
	    	allowFutureDates: true,
	    	doneButtonLabel: 'OK',
	    	doneButtonColor: '#2ECC71',
	    	cancelButtonLabel: 'Annulla',
	    	cancelButtonColor: '#CC0000'
	    };

    	$cordovaDatePicker.show(options_datepicker).then(function(date){
    		var d = new Date(date);
    		d.setHours(d.getHours() - Math.floor(d.getTimezoneOffset()/60));
    		
            $scope.coupon.data_inizio_erogazione = d;
            $scope.changeDuration();
        });

    };

    $scope.changeDuration = function(){
    	$scope.coupon.data_fine_erogazione = Coupon.scadenza_coupon($scope.coupon.data_inizio_erogazione, $scope.coupon.durata_coupon);
    	$scope.isAvailableDate = false;
    	couponDirty = true;
        $scope.couponForm.$dirty = true;
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

    	Coupon.useCamera(options_camera).then(function(response){
    	    $scope.coupon.filename = response;
    	    couponDirty = true;
    	    $scope.couponForm.$dirty = true;
    	}, function(error){
    		$scope.couponForm.$dirty = couponDirty;
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

    	Coupon.useCamera(options_photolibrary)
    		.then(function(response){
	            $scope.coupon.filename = response;
	            couponDirty = true;
				$scope.couponForm.$dirty = true;
    		}, function(error){
    			$scope.couponForm.$dirty = couponDirty;
    		});
    };

    $scope.removePhoto = function(){

    	$timeout(function() {
        	$scope.coupon.filename = userData.filename.replace('/lg_','/xl_');//'http://files.overplace.com/bacheca/xl_overplace.png';

        	couponDirty = true;
			$scope.couponForm.$dirty = true;
        }, 0);

    };
    
    $scope.create = function(coupon){
        
		$ionicLoading.show({
        	template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });		
		
        Coupon.create(coupon)
    		.then(function(response){
				$scope.couponForm.$dirty = false;
    			$ionicLoading.hide();
    			$ionicHistory.goBack(-2);
    			$cordovaToast.show('Coupon creato con successo','short','bottom');
    		}, function(error){
    			$ionicLoading.hide();
    			$cordovaToast.show('Errore creazione coupon','short','bottom');
    		});
        
    };

})

.controller('CouponOperationCtrl', function($rootScope, $scope, $stateParams, $cordovaDatePicker, $cordovaCamera, $cordovaToast, $ionicPopup, $ionicLoading, $ionicHistory, $timeout, Auth, Coupon){

	var userData = Auth.getUserData(null);
	
	$scope.social = userData.wmc_data.social;

	$scope.notifiche = {messaggi:userData.wmc_data.messaggi, app:userData.wmc_data.app};
	$scope.notifiche_checkbox = {email:0, sms:0};

	$scope.coupon = Coupon.get($stateParams.id);
	var staticCoupon  = angular.copy($scope.coupon);

	$scope.isAvailableDate = true;
	var couponDirty = false;

	$scope.coupon.data_inizio_erogazione = new Date($scope.coupon.data_inizio_erogazione).getTime();
	$scope.coupon.numero_coupon_erogabili = parseInt($scope.coupon.numero_coupon_erogabili);
	$scope.coupon.coupon_illimitati = ($scope.coupon.coupon_illimitati == "1") ? true : false;
	
	var originalCoupon = angular.copy($scope.coupon);

	$scope.$on('wizard:StepFailed', function(e, args) {

		if (args.index == 0){
			if (($scope.coupon.numero_coupon_erogabili == undefined || $scope.coupon.numero_coupon_erogabili.length == 0) && !$scope.coupon.coupon_illimitati){
				$ionicPopup.alert({
					title: 'Erogazione Coupon',
					template: 'Inserire un numero di quanti coupon possono essere erogati o scegliere l\'opzione illimitati'
				});

				return;
			}

			if ($scope.coupon.sconto.length == 0){
				$ionicPopup.alert({
					title: 'Valore Coupon',
					template: 'Inserire un valore'
				});

				return;
			}

			if (!$scope.isAvailableDate){

				if (!($scope.coupon.id_tipologia_stato == 1 && $scope.coupon.active == 1)){
					$ionicLoading.show({
						template: '<ion-spinner></ion-spinner>',
						noBackdrop: false
					});

					Coupon.checkDate($scope.coupon.data_inizio_erogazione, $scope.coupon.data_fine_erogazione).then(function(response){
						$scope.isAvailableDate = response;
						$ionicLoading.hide();
						
						if (response){
							$rootScope.$broadcast("wizard:Next");
						}else{
							$ionicPopup.alert({
								title: 'Attenzione',
								template: 'Per le date selezionate &egrave; gi&agrave; presente un altro coupon!'
							});
						}

					}, function(error){
						$ionicLoading.hide();
						$cordovaToast.show('Errore date coupon','short','bottom');
					});
				}else {
					$scope.isAvailableDate = true;
				}
			}

		}else if (args.index == 1) {

			if ($scope.coupon.titolo.length == 0){
				$ionicPopup.alert({
					title: 'Titolo Coupon',
					template: 'Assegna un titolo'
				});

				return;
			}


			if ($scope.coupon.descrizione.length == 0){
				$ionicPopup.alert({
					title: 'Descrizione Coupon',
					template: 'Inserisci una descrizione'
				});

				return;
			}

			if($scope.coupon.condizioni_legali.length == 0){
				$ionicPopup.alert({
					title: 'Condizioni Coupon',
					template: 'Specifica le condizioni di utilizzo'
				});

				return;
			}
		}
	});

	$scope.changeDate = function(){

		var options_datepicker = {
			date: new Date(),
			mode: 'date',
			minDate: (ionic.Platform.isAndroid()) ? new Date().getTime() : new Date(),
			allowOldDates: false,
			is24Hour: true,
			allowFutureDates: true,
			doneButtonLabel: 'OK',
			doneButtonColor: '#2ECC71',
			cancelButtonLabel: 'Annulla',
			cancelButtonColor: '#CC0000'
		};



		if (!($scope.coupon.notifiche.pendenti.email || $scope.coupon.notifiche.pendenti.sms) && !($scope.coupon.id_tipologia_stato == 1 && $scope.coupon.active == 1)){
			$cordovaDatePicker.show(options_datepicker).then(function(date){
				$scope.coupon.data_inizio_erogazione = new Date(date).getTime();
				$scope.changeDuration();
			});
		}
		
	};

	$scope.changeDuration = function(){
		$scope.coupon.data_fine_erogazione = Coupon.scadenza_coupon($scope.coupon.data_inizio_erogazione, $scope.coupon.durata_coupon);
		$scope.isAvailableDate = false;
		couponDirty = true;
		$scope.couponOneForm.$dirty = true;
	};

	$scope.changeToggle = function(){
		couponDirty = true;
       	$scope.couponOneForm.$dirty = true;
	};

	$scope.isEqual = function(){
		var eq = angular.equals(angular.copy($scope.coupon), staticCoupon);
		couponDirty = !eq;

		return eq;
	};

	$scope.takePhoto = function(){

		var options_camera = {
			quality: 100,
			correctOrientation: true,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 750,
			targetHeight: 570,
			saveToPhotoAlbum: true
		};

		Coupon.useCamera(options_camera).then(function(response){
			$scope.coupon.filename = response;

			couponDirty = true;
			$scope.couponTwoForm.$dirty = true;
		}, function(error){
			//error
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
			targetWidth: 750,
			targetHeight: 570
		};

		Coupon.useCamera(options_photolibrary).then(function(response){
				$scope.coupon.filename = response;
				couponDirty = true;
               	$scope.couponTwoForm.$dirty = true;
		}, function(error){
			//error
		});
	};

	$scope.removePhoto = function(){

		$timeout(function() {
			$scope.coupon.filename = 'http://files.overplace.com/bacheca/xl_overplace.png';
			couponDirty = true;
           	$scope.couponTwoForm.$dirty = true;
		}, 0);

	};
	
    $scope.update = function(coupon){
    	
    	$ionicLoading.show({
    		template: '<ion-spinner></ion-spinner>',
    		noBackdrop: false
    	});		
    	var changeImage = (coupon.filename != originalCoupon.filename) ? true : false;
    	Coupon.update(coupon, changeImage)
    	.then(function(response){
    		$scope.couponOneForm.$dirty = false;
    		$scope.couponTwoForm.$dirty = false;
    		$scope.couponThreeForm.$dirty = false;
    		$ionicLoading.hide();
    		$ionicHistory.goBack(-2);
    		$cordovaToast.show('Coupon modificato con successo','short','bottom');
    	}, function(error){
    		$ionicLoading.hide();
    		$cordovaToast.show('Errore modifica coupon','short','bottom');
    	});
    	
    };



})