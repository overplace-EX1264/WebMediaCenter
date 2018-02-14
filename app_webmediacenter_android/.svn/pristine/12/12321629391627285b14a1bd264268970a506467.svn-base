angular.module('help.controllers', [])

.controller('HelpCtrl', function($scope, Help){
	$scope.listModuli = Help.starter();

	$scope.isActive = function(element){
		return element.active;
	};
})

.controller('HelpDetailCtrl', function($scope, $stateParams, Help){
	$scope.helpDetail = Help.getModulo($stateParams.id);



});