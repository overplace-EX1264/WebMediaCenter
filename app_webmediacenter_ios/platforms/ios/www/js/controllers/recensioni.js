angular.module('recensioni.controllers', [])

.controller('recensioniCtrl', function($scope, $timeout, Recensioni){

	$scope.recensioni_list = [];
	$scope.isAvailable = true;

	$scope.loadMoreList = function(){
		Recensioni.loadMore().then(function(response){
			$scope.recensioni_list = response;
			$scope.isAvailable = Recensioni.getMoreStatus();
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}, function(error){
			$cordovaToast.show('Attenzione! Si è verificato un errore durante il caricamento','short','bottom');
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};

	$scope.refresh = function(){
		Recensioni.refreshList().then(function(response){
			$scope.recensioni_list = response;
			$scope.isAvailable = Recensioni.getMoreStatus();
			$scope.$broadcast('scroll.refreshComplete');
		}, function(error){
			$cordovaToast.show('Errore nel recupero delle recensioni!','short','bottom');
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

})

.controller('recensioniDetailCtrl', function($scope, $stateParams, $ionicLoading, Recensioni){

	$scope.recensione = Recensioni.get($stateParams.id);

	$scope.reply = function(risposta){
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner>',
			noBackdrop: false
		});

		Recensioni.reply($scope.recensione, risposta).then(function(response){
			$ionicLoading.hide();
			$scope.recensione.risposta = response;
			$cordovaToast.show('Risposta inserita con successo','short','bottom');
		}, function(error){
			$ionicLoading.hide();
			$cordovaToast.show('Errore inserimento risposta','short','bottom');
		});
	};

});