angular.module('starter.directive', [])

.directive('constantfocus', function($timeout, $ionicScrollDelegate){
  return {
	restrict: 'A',
    link: function(scope, element, attrs){
      element[0].addEventListener('focusout', function(e){
        element[0].focus();
      });
      element[0].addEventListener('focus', function(e){
    	  window.addEventListener('native.keyboardshow', scrollChat , 'native.keyboardshow');
    	  window.addEventListener('native.keyboardhide', scrollChat , 'native.keyboardhide');
    	  
    	  function scrollChat(listener){
    		  $timeout(function(){
    			  $ionicScrollDelegate.scrollBottom();
    		  }, 30);
    		  window.removeEventListener(listener, scrollChat , listener);
    	  }
      });
    }
  };
})

.directive('formValidateAfter', function(){
    function link(scope, element, attrs, ctrl){
        var validateClass = 'form-validate';
        ctrl.validate = false;
        element.bind('focus', function(evt){
            if(ctrl.validate && ctrl.$invalid){ // if we focus and the field was invalid, keep the validation
                element.addClass(validateClass);
                scope.$apply(function(){ ctrl.validate = true; });
            }else{
                element.removeClass(validateClass);
                scope.$apply(function(){ ctrl.validate = false; });
            }
        }).bind('blur', function(evt){
            element.addClass(validateClass);
            scope.$apply(function (){ ctrl.validate = true; });
        });
    }

    return {
        restrict: 'A',
        require: 'ngModel',
        link: link
    };
})

.directive('socialCheckbox', function($ionicPopup){
    return {
        restrict: 'E',
        scope: {
            soc: '=socialAssign',
            obj: '=controllerAssign',
            hideFacebook: '=?',
            disableFacebook: '=?',
            hideAlertTwitter: '=?',
            disableTwitter: '=?',
            hideAlertLinkedin: '=?',
            hideLinkedin: '=?',
            disableLinkedin: '=?',
            checkLinkedin: '=?'
        },
        link: function(scope, element, attrs, ctrl){

            scope.warned = {
                facebook: false,
                twitter: false,
                linkedin: false
            };

            scope.alertSocial = function (what){

            		var templ;

					switch (what){
						case 'facebook':
							if (typeof scope.disableFacebook != undefined && scope.disableFacebook == true)
								templ = 'Il coupon non pu&ograve; essere pubblicato su facebook finch&egrave; non sar&agrave; validato';
							else
								templ = 'Facebook non configurato';
						break;
						case 'twitter':
							if (typeof scope.disableTwitter != undefined && scope.disableTwitter == true)
								templ = 'Il coupon non pu&ograve; essere pubblicato su twitter finch&egrave; non sar&agrave; validato';
							else
								templ = 'Twitter non configurato';
						break;
						case 'linkedin':
						    if (typeof scope.disableLinkedin != undefined && scope.disableLinkedin == true)
                        		templ = 'Il coupon non pu&ograve; essere pubblicato su linkedin finch&egrave; non sar&agrave; validato';
                        	else
                        		templ = 'LinkedIn non configurato';
						break;
						default:
							templ = 'Facebook, Twitter e LinkedIn non configurati';
						break;
					}

				   $ionicPopup.alert({
					   title: 'Attenzione',
					   template: templ
				   }).then(function(res){
						switch (what){
							case 'facebook':
								scope.warned.facebook = true;
							break;
							case 'twitter':
								scope.warned.twitter = true;
							break;
							case 'linkedin':
							    scope.warned.linkedin = true;
							break;
							default:
							break;
						}
				   });
			};

			scope.alertTwitter = function (){
				if (scope.hideAlertTwitter != true){
					if (scope.obj.twitter){
						$ionicPopup.show({
							title: 'Attenzione',
							template: 'La pubblicazione su Twitter avverr&agrave; immediatamente. Non &egrave; possibile impostare una pubblicazione differita',
							scope: scope,
							buttons: [{
								text: 'Annulla',
								onTap : function(e){
									scope.obj.twitter = false;
								}
							}, {
								text: 'Ok',
								type: 'button-positive',
								onTap : function(e){
									scope.obj.twitter = true;
								}
							}]
						});
					}
				}
			};

			scope.alertLinkedin = function (){
			    if (scope.hideAlertLinkedin != true){
                    if (scope.obj.linkedin){
                        $ionicPopup.show({
                            title: 'Attenzione',
                            template: 'La pubblicazione su LinkedIn avverr&agrave; immediatamente. Non &egrave; possibile impostare una pubblicazione differita',
                            scope: scope,
                            buttons: [{
                                text: 'Annulla',
                                onTap : function (e){
                                    scope.obj.linkedin = false;
								}
							},
							{
								text: 'Ok',
								type: 'button-positive',
								onTap : function (e){
									scope.obj.linkedin = true;
								}
							}]
						});
					}
				}
			};
        },
        templateUrl: 'templates/directive/social_checkbox.html'
    };
})

.directive('notificheCheckbox', function($ionicPopup, $ionicLoading, $cordovaToast, ListeContatti){
    return {
        restrict: 'E',
        scope: {
            ableMessage: '=notificheMessaggi',
            statusCheckbox: '=statusCheckbox',
            obj: '=controllerAssign'
        },
        link: function(scope, element, attrs, ctrl){

            scope.warned = {
                sms: false,
                email: false
            };

            scope.emptyListaContatti = [];

            scope.getContactList = function(type){


                if(scope.statusCheckbox[type]){
                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner>',
                        noBackdrop: false
                    });

                    ListeContatti.getByType(type).then(function(response){
                        scope.obj['id_lista_'+type] = 0;
                        $ionicLoading.hide();
                        var tpl = '<div class="list">';
                        for(var i in response.liste_contatti){
                            tpl += '<label class="item item-radio">'+
                                    '<input type="radio" name="id_lista_'+type+'" ng-model="obj.id_lista_'+type+'" value="'+response.liste_contatti[i].id+'">'+
                                    '<div class="item-content item-text-wrap">('+response.liste_contatti[i].numero_contatti+') '+response.liste_contatti[i].titolo+'</div>'+
                                    '<i class="radio-icon ion-checkmark calm"></i>'+
                                    '</label>';
                        }

                        tpl += '</div>';

                        $ionicPopup.show({
                            title: 'Scegli una lista contatti',
                            template: tpl,
                            subTitle: 'per l&apos;invio della tua campagna '+type,
                            scope: scope,
                            buttons: [{
                                text: 'Annulla',
                                onTap : function(e){
                                    scope.statusCheckbox[type] = false;
                                    delete scope.obj['id_lista_'+type];
                                }
                            }, {
                                text: 'Conferma',
                                type: 'button-positive',
                                onTap : function(e){
                                    if((type == 'email' && (scope.obj.id_lista_email == null || scope.obj.id_lista_email == 0)) || (type == 'sms' && (scope.obj.id_lista_sms == null || scope.obj.id_lista_sms == 0))){
                                        e.preventDefault();
                                    }
                                }
                            }]
                        });

                    }, function(error){

                        $ionicLoading.hide();

                        scope.emptyListaContatti[type+'_disabled'] = true;

                        if(error !== null && typeof error === 'string'){
                            $cordovaToast.show(error,'short','bottom');
                        } else {
                            $cordovaToast.show('Errore nel recupero delle liste contatti','short','bottom');
                        }
                    });
                }else{
                    delete scope.obj['id_lista_'+type];
                }
            };

            scope.alertMessage = function (titolo, messaggio, what){
                $ionicPopup.alert({
                    title: titolo,
                    template: messaggio
                }).then(function(res){
                    switch (what){
                        case 'sms':
                            scope.warned.sms = true;
                        break;
                        case 'email':
                            scope.warned.email = true;
                        break;
                        default:
                        break;
                    }
                });
            };
        },
        templateUrl: function(elem, attr){
            return 'templates/directive/notifiche_checkbox_'+attr.mode+'.html'
        }
    }
})

.directive('customMaxlength', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			attrs.$set("ngTrim", "false");
            var maxlength = parseInt(attrs.customMaxlength, 10);
            ctrl.$parsers.push(function (value) {
                if (value.length > maxlength){
                    value = value.substr(0, maxlength);
                    ctrl.$setViewValue(value);
                    ctrl.$render();
                }
                return value;
            });
		}
	};
})

.directive('checkAvatar', function () {
    'use strict';
    var count = 0;
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            return attrs.$observe("afklLazyImageLoaded", function (value) {
            	if(value == 'fail'){
            		element[0].firstChild.setAttribute('src', 'http://www.overplace.com/avatar/ovp/avatar_default.png');
            	}
            });
        }
    };

})

.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }])

 .directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                alert(JSON.stringify(changeEvent.target.files));
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    }
}])


.directive("ngFileSelect",function(){

    return {
      link: function($scope,el){
        
        el.bind("change", function(e){
        
          $scope.file = (e.srcElement || e.target).files[0];
          $scope.getFile();
        })
        
      }
      
    }
    
    
  })
  .directive('fileUpload', function () {
    return {
        scope: true,        //create a new scope
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files = event.target.files;
                console.log(event.target);
                files.fullpath = document.getElementById("file").value;
                //iterate files since 'multiple' may be specified on the element
                for (var i = 0;i<files.length;i++) {
                    //emit event upward
                    scope.$emit("fileSelected", { file: files[i] });
                }                                       
            });
        }
    };
});
