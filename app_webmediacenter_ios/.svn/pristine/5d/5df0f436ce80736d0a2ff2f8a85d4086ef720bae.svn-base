angular.module('professional.controllers', [])

.controller('ProfessionalCtrl', function($scope, Auth){

	var userData = Auth.getUserData(null);
	$scope.isSupport = Object.keys(userData.support).length > 0;

	if($scope.isSupport){
		$scope.support_phone = userData.support.phone;
		$scope.support_email = userData.support.email;
	}

	$scope.call = function(phone){ window.location.href = 'tel:'+phone; };

	$scope.email = function(email){ window.location.href = 'mailto:'+email; };
})