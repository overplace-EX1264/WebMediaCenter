angular.module('notifiche.controllers', [])

.controller('NotificheCtrl', function($scope, Notifiche) {

    $scope.notifiche_list = Notifiche.getList();
    
    $scope.delete = function(notifica){
        Notifiche.delete(notifica);
    }

})

.controller('NotificheDetailCtrl', function($scope, $stateParams, Notifiche) {
    $scope.notifica = Notifiche.get($stateParams.id);
})