angular.module('starter.filter', [])

.filter('capitalize', function (){
	return function (input){
		return (angular.isString(input) && input.length > 0) ? input[0].toUpperCase() + input.substr(1).toLowerCase() : input;
	};
})

.filter('stripUnderscore', function (){
	return function (input){
		return (angular.isString(input) && input.length > 0) ? input.split("_").join(" ") : input;
	}
})

.filter('keys', function (){
	return function (obj){
		if (!obj || typeof obj != 'object'){
			return [];
		}
		
		return Object.keys(obj);
	}
});