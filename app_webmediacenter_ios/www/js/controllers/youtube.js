angular.module('youtube.controllers', [])

.controller('YoutubeCtrl', function($timeout, $scope, Youtube, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaCapture, $cordovaToast, $location, $timeout) {
    $scope.news_list = [];
    $scope.isAvailable = true;

    $scope.loadYoutube = function(){
        Youtube.loadMore().then(function(response){
            $scope.news_list = response;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function(error){
            $cordovaToast.show('Attenzione! Si è verificato un errore durante il caricamento','short','bottom');
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
})

.controller('YoutubeOperationCtrl', function($scope, $stateParams, $ionicHistory, $ionicPopup, $ionicLoading, $cordovaToast, Youtube) {
    $scope.defaultIcon = true;

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.device.capture);
    }

    $scope.youtube = [];
    $scope.youtube.facebook = false;
    $scope.youtube.twitter = false;
    $scope.youtube.linkedin = false;
    $scope.youtube.data_inizio_pubblicazione = new Date().getTime();
    $scope.youtube.filename = 'http://files.overplace.com/bacheca/xl_overplace.png';
    $scope.youtube.notifiche = {pendenti:{email:0}};

    $scope.takeVideo = function(){
        var options = {limit: 3, duration: 10}
        navigator.device.capture.captureVideo(onSuccess, onError, options);
        function onSuccess(mediaFiles) {
            var i, path, len;
            for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            path = mediaFiles[0].fullPath; 
            $scope.defaultIcon = false;
            $timeout(function() {
                    $scope.clipSrc = path;
            }, 500)  
            }
        }
        function onError(error) {
            alert('Error code: ' + error.code, null, 'Capture Error');
        }
    };

    $scope.getVideoAlbum = function() {

        var options_photolibrary = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,    
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: Camera.MediaType.VIDEO,
        }

        Youtube.useCamera(options_photolibrary)
            .then(function(response){ 
                path = response.file;
                $scope.defaultIcon = false;
                $timeout(function() {
                    $scope.clipSrc = response;
                }, 500)  
                formDirty = true;
                $scope.youtubeForm.$dirty = true;
            }, function(error){ 
                alert(JSON.stringify(error))
                $scope.youtubeForm.$dirty = formDirty;
            });
    };
})