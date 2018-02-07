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
            Youtube.buildApiRequest('GET',
            '/youtube/v3/search',
            {
                'maxResults': '25',
                'forMine': 'true', 
                'part': 'snippet', 
                'q': '', 
                'type': 'video'
                }).then(function(listData){ 
                    // alert("listData");                
                    // alert(JSON.stringify(listData));
                $scope.youtubeChannelList = listData;
                $ionicLoading.hide();
            }, function(error){ 
                alert(JSON.stringify(error));
                $ionicLoading.hide();
            });
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
      $scope.delVideo = function (id){
        $ionicLoading.show();
            Youtube.buildApiRequest('DELETE',
            '/youtube/v3/videos',
            {'id': id}).then(function(msg){ 
                            console.log(msg)
                            $scope.getList();
                        }, function(error){ 
                            alert(JSON.stringify(error));
                            $ionicLoading.hide();
                    });
      }
      $scope.doRefresh = function() {
        // here refresh data code
        if($scope.user){
            Youtube.gapiSetToken($scope.user.accessToken);
            $scope.getList();
        }
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$apply()
     };
})

.controller('YoutubeOperationCtrl', function($scope, $stateParams, $ionicHistory,$cordovaCamera, $ionicPopup, $ionicLoading, $cordovaToast, Youtube) {
    $scope.defaultIcon = true;
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.device.capture);
    }
    $scope.uploaded = 0;
    
    $scope.youtube = [];
    $scope.youtube.facebook = false;
    $scope.youtube.twitter = false;
    $scope.youtube.linkedin = false;
    $scope.youtube.data_inizio_pubblicazione = new Date().getTime();
    $scope.youtube.filename = 'http://files.overplace.com/bacheca/xl_overplace.png';
    $scope.youtube.notifiche = {pendenti:{email:0}};
    $scope.clipSrc = new File();
    $scope.takeVideo = function () {
        $ionicLoading.show();
            var captureSuccess = function(mediaFiles) {
                var i, path, len;
                $scope.defaultIcon = false;
                    $ionicLoading.hide();
                    console.log(mediaFiles[0]);
                    files = mediaFiles;
                    $scope.clipSrc = mediaFiles[0];
                    $scope.videoPath = mediaFiles[0].fullPath;
            };
            var captureError = function(error) {
                $ionicLoading.hide();
                navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
            };
            navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:2});
    }
    

    //listen for the file selected event
    $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {            
            //add the file object to the scope's files collection
            $scope.clipSrc = args.file;
            $scope.clipSrc2 = cordova.file.tempDirectory+""+args.file.name;
            $scope.size = ((args.file.size / 1024)/1024).toFixed(2);
            // var fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),
            // i=0;while(args.file.size>900){args.file.size/=1024;i++;}
            // $scope.size = (Math.round(args.file.size*100)/100)+' '+fSExt[i];
            // alert(exactSize);
            $scope.defaultIcon = false;
            $ionicLoading.hide();
        });
    });
    // $scope.openFile = function (){
    //     setTimeout(function() {
    //         var element = angular.element(document.getElementById('input'));
    //         element.triggerHandler('click');
    //         $scope.clicked = true;
    //       }, 0);
    // }
    $scope.removeVideo = function () {
        $scope.clipSrc  = null;
        $scope.videoPath = null;
        $scope.defaultIcon = true;
        formDirty = false;
        // $scope.youtubeForm.$dirty = false;
    }

    $scope.nowTimeToRock = function () {
        $ionicLoading.show();
        $scope.uploaded = 0;
        
        $scope.user = Youtube.getUser();
        var metadata = {
            snippet : {
                categoryId: '22',
                defaultLanguage: 'en',
                description: $scope.youtube.descrizione,
                snip: $scope.youtube.keyword.split(','),
                title: $scope.youtube.titolo,
            },
            status :{
                privacyStatus: 'public',
            }              
        };
        var params = {'part': 'snippet,status'};
        // $scope.clipSrc = 'img/video.mp4';
        console.log($scope.clipSrc);
       
        Youtube.gapiSetToken($scope.user.accessToken);
        var uploader = new MediaUploader({
            baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
            file: $scope.clipSrc,
            token: $scope.user.accessToken,
            metadata: metadata,
            params: params,
            onError: function(data) {
                var message = data;
                try {
                    var errorResponse = JSON.parse(data);
                    message = errorResponse.error.message;
                } finally {
                    alert(JSON.stringify(message));
                }
            },
            onProgress: function(data) {
                var currentTime = Date.now();
                console.log('Progress: ' + data.loaded + ' bytes loaded out of ' + data.total);
                var totalBytes = data.total;
                $scope.uploadingLeng = data;
                $scope.uploaded = Math.round((data.loaded * 100)/data.total);
                $scope.remaining = 100 - $scope.uploaded;
                console.log('Progress: ' + $scope.uploaded);                
            },
            onComplete: function(data) {
                // $scope.uploaded
                var uploadResponse = JSON.parse(data);
                console.log('Upload complete for video ' + uploadResponse.id);
                $ionicLoading.hide();
                alert("Upload complete ");
                $scope.uploaded = 0;
                $ionicHistory.goBack();
            }
        });

        uploader.upload();
    }
    function createResource(properties) {
        var resource = {};
        var normalizedProps = properties;
        for (var p in properties) {
          var value = properties[p];
          if (p && p.substr(-2, 2) == '[]') {
            var adjustedName = p.replace('[]', '');
            if (value) {
              normalizedProps[adjustedName] = value.split(',');
            }
            delete normalizedProps[p];
          }
        }
        for (var p in normalizedProps) {
          // Leave properties that don't have values out of inserted resource.
          if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
            var propArray = p.split('.');
            var ref = resource;
            for (var pa = 0; pa < propArray.length; pa++) {
              var key = propArray[pa];
              if (pa == propArray.length - 1) {
                ref[key] = normalizedProps[p];
              } else {
                ref = ref[key] = ref[key] || {};
              }
            }
          };
        }
        return resource;
      }
}).filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);