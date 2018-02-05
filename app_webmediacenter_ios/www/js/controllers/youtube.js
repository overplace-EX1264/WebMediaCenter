angular.module('youtube.controllers', [])

.controller('YoutubeCtrl', function($timeout, $scope, Youtube, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaCapture, $cordovaToast, $location, $timeout,$http,ApiConfig, $state, Youtube,$ionicActionSheet){
    $scope.news_list = [];
    $scope.isAvailable = true;
    
    var GoogleAuth;
    $scope.youtubeChannelList = {};
    $scope.authResult;

    $scope.googleSignIn = function() {
        $ionicLoading.show();
        Youtube.GoogleLogin().then(
          function (user_data) {
            Youtube.setUser(user_data);
            $scope.user = Youtube.getUser();
            Youtube.googleAuth().then(
                function (authResult) {
                  $scope.authResult = authResult;
                 Youtube.gapiSetToken($scope.user.accessToken);
                    Youtube.buildApiRequest('GET',
                        '/youtube/v3/search',
                        {
                            'maxResults': '25',
                            'forMine': 'true', 
                            'part': 'snippet', 
                            'q': '', 
                            'type': 'video'
                        }).then(function(listData){ 
                            $scope.youtubeChannelList = listData;
                            $ionicLoading.hide();
                        }, function(error){ 
                            alert(JSON.stringify(error));
                            $ionicLoading.hide();
                    });
                },
                function (err) {
                  alert(JSON.stringify(err));
                  $ionicLoading.hide();
                });       
          },
          function (error) {
            alert(JSON.stringify(error))
            $ionicLoading.hide();
          });       
      };
      $scope.user = Youtube.getUser();
      $scope.getList = function () {
        alert("User");          
        alert(JSON.stringify($scope.user));          
          if ($scope.authResult && $scope.user) {
            Youtube.buildApiRequest('GET',
            '/youtube/v3/search',
            {
                'maxResults': '25',
                'forMine': 'true', 
                'part': 'snippet', 
                'q': '', 
                'type': 'video'
            }).then(function(listData){ 
                alert("listData");                
                alert(JSON.stringify(listData));
                $scope.youtubeChannelList = listData;
                $ionicLoading.hide();
            }, function(error){ 
                alert(JSON.stringify(error));
                $ionicLoading.hide();
            });
          } else {
              alert("You are not authorize please login.");
          }
      }
      $scope.showLogOutMenu = function() {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>',
            noBackdrop: false
        });
        Youtube.googleLogout().then(
            function (msg) {
                $ionicLoading.hide();
                $scope.user = null;
                Youtube.removeUser();
            },
            function(fail){
                alert("eee");                
                alert(JSON.stringify(fail));                
                console.log(fail);
                $ionicLoading.hide();
            }
        );
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