angular.module('promozioni.controllers', [])

.controller('PromozioniCtrl', function($scope, $ionicPopup, $ionicLoading, $cordovaToast, $location, $timeout, Auth, Promozioni, Help, initial) {

	var userData = Auth.getUserData(null);
	
	$scope.moduloPromozioni = userData.wmc_data.promozioni;
	$scope.isSupport = Object.keys(userData.support).length > 0;
	
	if($scope.isSupport){
		$scope.support_phone = userData.support.phone;
	}

	if(!$scope.moduloPromozioni){
		$scope.inactive = Help.getModulo('promozioni');
	}else{
		$scope.promozioni_list = initial;
	}
	
	$scope.call = function(phone){
    	window.location.href = 'tel:'+phone;
    }
	
    $scope.edit = function(id){
    	$location.path("/app/promozioni/"+id+"/edit");
    }
    
    $scope.refresh = function(){
		$scope.promozioni_list = [];
    	Promozioni.refreshList()
            .then(function(response){
            	$timeout(function(){
            		$scope.promozioni_list = response;
                    $scope.$broadcast('scroll.refreshComplete');
            	});
            }, function(error){
                $cordovaToast.show('Errore nel recupero della promozione!','short','bottom');
                $scope.$broadcast('scroll.refreshComplete');
            });

    };
    
})

.controller('PromozioniOperationCtrl', function($scope, $stateParams, $ionicLoading, $cordovaToast, $ionicPopup, $ionicHistory, Auth, Promozioni, ListeContatti) {
	
	var wmc_data = Auth.getUserData('wmc_data');
		
	$scope.social = wmc_data.social;
	
	$scope.notifiche = {messaggi:wmc_data.messaggi, app:wmc_data.app};
	$scope.notifiche_checkbox = {email:0, sms:0};
	
	$scope.emptyListaContatti = {email_disabled:false, sms_disabled:false};
	
	var currentView = $ionicHistory.currentView();
	var formDirty = false;

	$scope.promozione = Promozioni.get($stateParams.id);

	var originalPromozione = angular.copy($scope.promozione);
	
    $scope.isEqual = function(){
    	var eq = angular.equals(originalPromozione, angular.copy($scope.promozione));
    	
    	formDirty = !eq;
        $scope.promozioneForm.$dirty = formDirty;
        
    	return eq;
    };
    
    $scope.update = function(promozione){

		$ionicLoading.show({
        	template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });
		
        Promozioni.update(promozione)
        	.then(function(response){
    	        $scope.promozioneForm.$dirty = false;
    			$ionicLoading.hide();
    			$ionicHistory.goBack(-1);
    			$cordovaToast.show('Promozione modificata con successo','short','bottom');
    		}, function(error){
    			$ionicLoading.hide();
    			$cordovaToast.show('Errore modifica promozione','short','bottom');
    		});
        
    };


    
});