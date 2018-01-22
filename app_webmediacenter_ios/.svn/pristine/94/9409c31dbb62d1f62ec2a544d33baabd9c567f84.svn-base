angular.module("rubrica.controllers", [])

.controller("RubricaCtrl", function($scope, $timeout, $ionicPopover, $ionicPopup, $ionicLoading, $cordovaToast, Rubrica){
	var _contatti = [],
		_pointer = 0,
		_limit = 10,
		_notFirstTimes = false;
	
	$scope.contatti = [];
	$scope.contact_selected = [];
	$scope.filter = { value: "0" };
	$scope.popover = null;
	$scope.allSelected = false;
	$scope.hasMoreContact = false;
	
	$scope.selectContact = function (contatto){
		contatto.checked = !contatto.checked;
		if (contatto.checked){
			$scope.contact_selected.push(contatto);
			if ($scope.contact_selected.length == $scope.contatti.length){ $scope.allSelected = true; }
		} else {
			var index = $scope.contact_selected.indexOf(contatto);
			if (index  > -1){ 
				$scope.contact_selected.splice(index, 1);
				$scope.allSelected = false;
			}
		}
	}
	
	$scope.selectAll = function (){
		var i,
			contatto;
		
		$scope.contact_selected = [];
		
		for (i = 0; i < _contatti.length; i++){
			contatto = _contatti[i];
			contatto.checked = true;
			$scope.contact_selected.push(contatto);
		}
		
		$scope.allSelected = true;
	}
	
	$scope.deselectAll = function (){
		var i,
			contatto;
		
		for (i = 0; i < _contatti.length; i++){
			contatto = _contatti[i];
			contatto.checked = false;
		}
		
		$scope.contact_selected = [];
		$scope.allSelected = false;
	}
	
	$scope.sincronizza = function(){
		if ($scope.popover != null){ $scope.popover.hide(); }
		
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner>',
			noBackdrop: false
		});
		
		Rubrica.sincro().then(function(response){
			$ionicLoading.hide();
			if (response.length == 0){
				$scope.contatti = [];
				_contatti = [];
				$cordovaToast.show("Tutti i contatti validi sono stati caricati", 'long', 'bottom');
			}else{
				_pointer = 0;
				_contatti = response;
				
				$scope.deselectAll();
				
				if (_contatti.length > _limit){
					$scope.hasMoreContact = true;
					if (_notFirstTimes){ 
						$scope.contatti = [];
						$scope.loadMoreContact(); 
					}
				}else {
					$scope.contatti = response;
				}
				
				_notFirstTimes = true;
				
				$scope.contact_selected = [];
				$scope.allSelected = false;	
			}
		}, function(error){
			$ionicLoading.hide();
			$cordovaToast.show(error.message,'short','bottom');
		});
	}
	
	$scope.showOptions = function($event){
		$scope.popover = $ionicPopover.fromTemplateUrl('templates/partial/rubrica/nav_menu_options.html', {
			scope: $scope
		}).then(function(popover){
			$scope.popover = popover;
			$scope.popover.show($event);
		});
	}
	
	$scope.refresh = function(){
		Rubrica.sincro().then(function(response){
			$ionicLoading.hide();
			
			if (response.length == 0){
				$scope.contatti = [];
				_contatti = [];
				$cordovaToast.show("Tutti i contatti validi sono stati caricati", 'long', 'bottom');
			}else{
				_pointer = 0;
				_contatti = response;
				
				$scope.deselectAll();
				
				if (_contatti.length > _limit){
					$scope.hasMoreContact = true;
					if (_notFirstTimes){
						$scope.contatti = [];
						$scope.loadMoreContact(); 
					}
				}else {
					$scope.contatti = response;
				}
				
				_notFirstTimes = true;
				
				$scope.contact_selected = [];
				$scope.allSelected = false;
			}
			
			$scope.$broadcast('scroll.refreshComplete');
		}, function(error){
			$ionicLoading.hide();
			$cordovaToast.show(error,'short','bottom');
			$scope.$broadcast('scroll.refreshComplete');
		});
		
	}
	
	$scope.loadMoreContact = function (){
		if (!$scope.hasMoreContact){ return; }
		
		var start = _pointer * _limit,
			end = (_pointer * _limit) + _limit;
		
		if (start > (_contatti.length - 1)){
			$scope.hasMoreContact = false;
			return;
		}
		
		if (end > _contatti.length){
			end = _contatti.length;
		}
		
		for (var i = start; i < end; i++){
			$scope.contatti.push(_contatti[i]);
		}
		
		_pointer++;
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}
	
	$scope.uploadContact = function (){
		if ($scope.contact_selected.length == 0){
			$cordovaToast.show('Nessun contatto selezionato','short','bottom');
			return;
		}
		
		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner>',
			noBackdrop: false
		});
		
		Rubrica.upload($scope.contact_selected).then(function (){
			$ionicLoading.hide();
			$cordovaToast.show($scope.contact_selected.length + " contatti caricati!",'short','bottom');
			$scope.contact_selected = [];
			$scope.allSelected = false;
			$scope.sincronizza();			
		}, function (error){
			$ionicLoading.hide();
			$cordovaToast.show("Impossibile caricare i contatti selezionati!",'short','bottom');
			$scope.deselectAll();
		});
	}
	
	$scope.showFilter = function (){
		if ($scope.contatti.length == 0){
			$cordovaToast.show("Non ci sono contatti da filtrare",'short','bottom');
			return true;
		}
		
		$scope.popover.hide();
		var confirmPopup = $ionicPopup.confirm({
			title: 'Filtra contatti per',
			templateUrl: "templates/partial/rubrica/filter.html",
			scope: $scope,
			okText: 'Filtra',
			cancelText : 'Pulisci'
		});

		confirmPopup.then(function(ok){
			for (var i in _contatti){ _contatti[i].checked = false; }
			$scope.contact_selected = [];
			$scope.allSelected = false;
			
			if(ok){
				$ionicLoading.show({
					template: '<ion-spinner></ion-spinner>',
					noBackdrop: false
				});
				$scope.contatti = [];
				if ($scope.filter.value != "1" && $scope.filter.value != "2"){
					if (_contatti.length > _limit){
						$scope.hasMoreContact = true;
						_pointer = 0;
						$scope.loadMoreContact();
					}else {
						$scope.contatti = _contatti;
					}
					$scope.filter.value = "0";
					$ionicLoading.hide();
				}else if ($scope.filter.value == "1"){
					//Filtro per email
					for (var i = 0; i < _contatti.length; i++){
						if (_contatti[i].emails.length > 0){ $scope.contatti.push(_contatti[i]); }
					}
					$scope.hasMoreContact = false;
					$ionicLoading.hide();
					$cordovaToast.show($scope.contatti.length + " contatti trovati",'short','bottom');
				}else if ($scope.filter.value == "2"){
					//Filtro per numero
					for (var i = 0; i < _contatti.length; i++){
						if (_contatti[i].numbers.length > 0){ $scope.contatti.push(_contatti[i]); }
					}
					$scope.hasMoreContact = false;
					$ionicLoading.hide();
					$cordovaToast.show($scope.contatti.length + " contatti trovati",'short','bottom');
				}
			}else {
				if (_contatti.length > _limit){
					_pointer = 0;
					$scope.loadMoreContact();
					$scope.hasMoreContact = true;	
				}else {
					$scope.contatti = _contatti;
				}
				
				$scope.filter.value = "0";
				$ionicLoading.hide();
			}
		});
	}
	
	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.popover.remove();
		$scope.popover = null;
	});
	
	// Execute action on hide popover
	$scope.$on('popover.hidden', function() {
		// Execute action
	});
	
	// Execute action on remove popover
	$scope.$on('popover.removed', function() {
		// Execute action
	});
	
})