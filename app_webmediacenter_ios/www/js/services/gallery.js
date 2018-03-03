angular.module('gallery.services', [])

.factory('Gallery', function($http, $q, $cordovaCamera, $ionicPopup, ApiConfig, Cache, $ionicLoading) {
	
	var _this = this;
	
	this.camera = function(options){
    	
    	var deferred = $q.defer();
    	
	    $cordovaCamera.getPicture(options)
	    	.then(function(imageData){

				var box_image = document.getElementById('box-image-evento');
				
				var img = new Image();
				img.src = "data:image/jpeg;base64,"+imageData;
				img.onload = function(){
					if(this.width < this.height){

						var tmpl;
						if (options.hasOwnProperty("mediaType") && options.mediaType == 0){
							tmpl = 'La larghezza dell\'immagine deve essere superiore alla sua altezza!<br>Scegli un\'altra immagine.';
						}else{
							tmpl = 'La larghezza dell\'immagine deve essere superiore alla sua altezza!<br>Ruota lo smartphone.';
						}
						
						var confirmPopup = $ionicPopup.confirm({
							title: 'Attenzione',
			                template: tmpl,
			                okText: 'OK',
			                cancelText : 'Annulla'
			            });
			            confirmPopup.then(function(ok){
			                if(ok) {
								$ionicLoading.show();
								_this.camera(options).then(function (response) {
									deferred.resolve(response);
								},function (err) {
									if(err != "Selection cancelled." && err != "Camera cancelled."){
										$ionicPopup.alert({
											title: 'Attenzione',
											template: 'L\'immagine non pu&ograve; essere utilizzata in quanto non risiede fisicamente sul tuo device.'
										});
									}
									deferred.reject();							
								});
								return deferred.promise;
							}
			            });
		    	    }else{
		    	    	deferred.resolve("data:image/jpeg;base64,"+imageData);
		    	    }
				}
			    
			},function(err){
				if(err != "Selection cancelled." && err != "Camera cancelled."){
					$ionicPopup.alert({
						title: 'Attenzione',
						template: 'L\'immagine non pu&ograve; essere utilizzata in quanto non risiede fisicamente sul tuo device.'
					});
				}
				deferred.reject();
			});
	    
	    return deferred.promise;
	    
    };
    
	return {
		 useCamera: function(options){
	        	
        	var deferred = $q.defer();
        	
        	_this.camera(options)
	        	.then(function(response){
	        		deferred.resolve(response);
	        	}, function(error){
	        		deferred.reject();
	        	});
        
        	return deferred.promise;
        },
        
        create : function(gallery){
        	var deferred = $q.defer();
        	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/gallery/'+window.localStorage['id_scheda'];
        	var param = {
        		filename : gallery.filename,
        		moduli : gallery.moduli_selezionati,
        		operation : 'create'
        	};
        	
        	$http({
                method: 'POST',
                url: urlApiHmac,
                data: JSON.stringify(param).replace(/\//g,'\\/'),
                cache: false,
                hmac: true
            })
            .success(function(data, status, headers, config){
            	
            	if(data.hasOwnProperty('error') != false){
            		deferred.reject();
            	}else{
        	        deferred.resolve(data);
            	}
            })
            .error(function(data, status, headers, config){
            	deferred.reject();
            });
        	
        	return deferred.promise;
        	
        }
	}
});