angular.module('youtube.controllers', [])

.controller('YoutubeCtrl', function($timeout, $scope, Youtube, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaCapture, $cordovaToast, $location, $timeout,$http,ApiConfig, $state, Youtube,$ionicActionSheet){
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
    $scope.googleSignIn = function() {
        // $ionicLoading.show({
        //     template: '<ion-spinner></ion-spinner>',
        //     noBackdrop: false
        // });
    
        window.plugins.googleplus.login(
          {},
          function (user_data) {
            // For the purpose of this example I will store user data on local storage
            Youtube.setUser({
              userID: user_data.userId,
              name: user_data.displayName,
              email: user_data.email,
              picture: user_data.imageUrl,
              accessToken: user_data.accessToken,
              idToken: user_data.idToken
            });
            $ionicLoading.hide();
            $scope.user = Youtube.getUser();
          },
          function (msg) {
            $ionicLoading.hide();
          }
        );
      };
      $scope.user = Youtube.getUser();

      $scope.showLogOutMenu = function() {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });
        window.plugins.googleplus.logout(
            function (msg) {
                $ionicLoading.hide();
                $scope.user = null;
                Youtube.removeUser();
            },
            function(fail){
                console.log(fail);
                $ionicLoading.hide();
            }
        );
        //   var hideSheet = $ionicActionSheet.show({
        //       destructiveText: 'Logout',
        //       titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
        //       cancelText: 'Cancel',
        //       cancel: function() {},
        //       buttonClicked: function(index) {
        //           return true;
        //       },
        //       destructiveButtonClicked: function(){
        //           $ionicLoading.show({
        //               template: 'Logging out...'
        //           });
        //           // Google logout
        //           window.plugins.googleplus.logout(
        //               function (msg) {
        //                   console.log(msg);
        //                   $ionicLoading.hide();
        //                   $state.go('welcome');
        //               },
        //               function(fail){
        //                   console.log(fail);
        //               }
        //           );
        //       }
        //   });
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

    // $scope.takeVideo = function(){
    //     var options = {limit: 3, duration: 10}
    //     navigator.device.capture.captureVideo(onSuccess, onError, options);
    //     function onSuccess(mediaFiles) {
    //         var i, path, len;
    //         for (i = 0, len = mediaFiles.length; i < len; i += 1) {
    //         path = mediaFiles[0].fullPath; 
    //         $scope.defaultIcon = false;
    //         $timeout(function() {
    //                 $scope.clipSrc = path;
    //         }, 500)  
    //         }
    //     }
    //     function onError(error) {
    //         alert('Error code: ' + error.code, null, 'Capture Error');
    //     }
    // };
    // $scope.takeVideo = function(){
    //     var options = {limit: 3, duration: 10}
    //     Youtube.usevideoCamera(options).then(function(response){ 
    //         path = response.file;
    //         alert(JSON.stringify(response));
    //         $scope.defaultIcon = false;
    //         $timeout(function() {
    //             $scope.clipSrc = response;
    //         }, 500)  
    //         formDirty = true;
    //         $scope.youtubeForm.$dirty = true;
    //     }, function(error){ 
    //         alert(JSON.stringify(error))
    //         $scope.youtubeForm.$dirty = formDirty;
    //     });
    // };
    $scope.takeVideo = function () {
        $ionicLoading.show();
            var captureSuccess = function(mediaFiles) {
                var i, path, len;
                $scope.defaultIcon = false;
                // console.log(JSON.stringify(mediaFiles));
                // $timeout(function () {
                    $ionicLoading.hide();
                    $scope.clipSrc = mediaFiles[0].fullPath;
                // },1000);
                // for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                //     path = mediaFiles[i].fullPath;
                // }
            };
            var captureError = function(error) {
                $ionicLoading.hide();
                navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
            };
            navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:2});
    }

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
                $scope.clipSrc = response;
                formDirty = true;
                $scope.youtubeForm.$dirty = true;
            }, function(error){ 
                alert(JSON.stringify(error))
                $scope.youtubeForm.$dirty = formDirty;
            });
    };
    $scope.removeVideo = function () {
        $scope.clipSrc = null;
        $scope.defaultIcon = true;
        formDirty = false;
        $scope.youtubeForm.$dirty = false;
    }
})