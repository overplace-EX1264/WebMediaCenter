angular.module('convalide.controllers', [])

.controller('ConvalideCtrl', function($scope, $ionicPopup, $cordovaToast, Convalide, Cache, $timeout) {
	
    $scope.showDelete = false;
    $scope.disableResync = (window.localStorage['convalideRemoved'] !== undefined && window.localStorage['convalideRemoved'].length > 0 && JSON.parse(window.localStorage['convalideRemoved']).length > 0) ? false : true;
    $scope.convalide_list = Convalide.getList();
    $scope.convalide_count = Convalide.getTotalCount();

    $scope.refresh = function(){

        Convalide.refreshList()
            .then(function(response){
                $scope.convalide_list = Cache.convalideCache;
                $scope.convalide_count = Convalide.getTotalCount();
                $scope.$broadcast('scroll.refreshComplete');
            }, function(error){
                $cordovaToast.show('Errore nel recupero delle convalide!','short','bottom');
                $scope.$broadcast('scroll.refreshComplete');
            });

    };

    $scope.delete = function(convalida, type){
        Convalide.delete(convalida, type);
        $scope.disableResync = false;
    }

    $scope.resync = function(){

        var confirmPopup = $ionicPopup.confirm({
            title: 'Ripristina notifiche',
            template: 'Sei sicuro di voler ripristinare tutte le notifiche nascoste?',
            okText: 'OK',
            cancelText : 'Annulla'
        }).then(function(ok){
            if(ok){
                Convalide.resync();
                $scope.convalide_list = Cache.convalideCache;
                $scope.convalide_count = Convalide.getTotalCount();
                $scope.disableResync = true;
            }
        });
    }

   $scope.$watch(function(){
       return Cache.convalideCache
   },function(newVal,oldVal){
       if(newVal !== undefined && newVal != oldVal){
           $scope.convalide_list = newVal;
           $timeout(function() {
        	   $scope.$digest();
           });
       }
   });

})

.controller('ConvalideDetailCtrl', function($scope, $stateParams, $ionicHistory, $ionicPopup, $ionicLoading, Convalide, Cache) {

    $scope.convalida = Cache.convalideCacheId[$stateParams.id];

    $scope.convalida_checkin = function(convalida){
        confirmAction(convalida, true, 'Promozione', 'Sei sicuro di voler convalidare la promozione?');
    }

    $scope.accetta_prenotazione = function(convalida){
        confirmAction(convalida, true, 'Prenotazione', 'Sei sicuro di voler accettare la prenotazione?');
    }

    $scope.rifiuta_prenotazione = function(convalida){
        confirmAction(convalida, false, 'Prenotazione', 'Sei sicuro di voler rifiutare la prenotazione?');
    }

    function confirmAction(convalida, action, title, template){

        var confirmPopup = $ionicPopup.confirm({
            title: title,
            template: template,
            okText: 'OK',
            cancelText: 'Annulla'
        }).then(function(ok){
            if(ok){

                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>',
                    noBackdrop: false
                });

                Convalide.move(convalida,action)
                    .then(function(response){
                        $ionicLoading.hide();
                        $ionicHistory.goBack();
                    }, function(error){
                        $ionicLoading.hide();
                        $ionicHistory.goBack();
                    });
            }
        });

    }

});