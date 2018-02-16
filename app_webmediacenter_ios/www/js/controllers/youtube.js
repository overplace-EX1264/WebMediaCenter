angular.module('youtube.controllers', [])

.controller('YoutubeCtrl', function($timeout, $scope, Youtube, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaCapture, $cordovaToast, $location, $timeout,$http,ApiConfig, $state, Youtube,$ionicActionSheet){
    $scope.news_list = [];
    $scope.isAvailable = true;
    
    var GoogleAuth;
    $scope.youtubeChannelList = {};
    $scope.authResult;
    $scope.user = Youtube.getUser();
    console.log("User");
    console.log($scope.user);
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
                            console.log(JSON.stringify(error));
                            $ionicLoading.hide();
                    });
                },
                function (err) {
                  console.log(JSON.stringify(err));
                  $ionicLoading.hide();
                });       
          },
          function (error) {
            console.log(JSON.stringify(error))
            $ionicLoading.hide();
          });       
      };
     
      $scope.getList = function () {      
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
                    // console.log("listData");                
                    // console.log(JSON.stringify(listData));
                $scope.youtubeChannelList = listData;
                $ionicLoading.hide();
            }, function(error){ 
                console.log(JSON.stringify(error));
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
                console.log("eee");                
                console.log(JSON.stringify(fail));                
                console.log(fail);
                $ionicLoading.hide();
            }
        );
      };
      $scope.delVideo = function (id){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Attenzione',
            template: "Sei sicuro di voler eliminare il video dal canale Youtube?",
            okText: 'Elimina',
            cancelText : 'Annulla'
        });
        confirmPopup.then(function(ok){
            if(ok) {
                $ionicLoading.show();
                Youtube.buildApiRequest('DELETE',
                '/youtube/v3/videos',
                {'id': id}).then(function(msg){ 
                            $scope.getList();
                        }, function(error){ 
                            console.log(JSON.stringify(error));
                            $ionicLoading.hide();
                    });
            };
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
     $scope.edit = function(list){
        $location.path("/app/youtube/edit/"+list.id.videoId);
        // console.log(list);
        // .id.videoId
    }
    
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
                    console.log("TakeVideo");                    
                    console.log("file://"+ mediaFiles[0].fullPath);
                    // files = mediaFiles;
                    $scope.clipSrc = "file://"+ mediaFiles[0].fullPath;
                    $scope.clipSrc2 = "file://"+ mediaFiles[0].fullPath;
                    // $scope.clipSrc = mediaFiles[0];
                    // $scope.videoPath = mediaFiles[0].fullPath;
            };
            var captureError = function(error) {
                $ionicLoading.hide();
                navigator.notification.console.log('Error code: ' + error.code, null, 'Capture Error');
            };
            navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:2});
    }
   $scope.getVideoAlbum  = function () {
    $ionicLoading.show();
        var options = {
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: 1,
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI
          }
          var captureSuccess = function(mediaFiles) {
            var i, path, len;
            $scope.defaultIcon = false;
                $ionicLoading.hide();
                console.log("Gally");
                console.log(mediaFiles);
                // files = mediaFiles;
                // $scope.clipSrc = "file://"+ mediaFiles[0].fullPath;
                $scope.clipSrc = mediaFiles;
                $scope.clipSrc2 = mediaFiles;
                // $scope.videoPath = mediaFiles[0].fullPath;
        };
        var captureError = function(error) {
            $ionicLoading.hide();
            navigator.notification.console.log('Error code: ' + error.code, null, 'Capture Error');
        };
          navigator.camera.getPicture(captureSuccess, captureError, options);
          
    }

    //listen for the file selected event
    $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {            
            //add the file object to the scope's files collection
            console.log(args);
            console.log(cordova.file.tempDirectory);
            $scope.clipSrc = args.file;
            $scope.clipSrc2 = cordova.file.tempDirectory+""+args.file.name;
            $scope.size = ((args.file.size / 1024)/1024).toFixed(2);
            // var fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),
            // i=0;while(args.file.size>900){args.file.size/=1024;i++;}
            // $scope.size = (Math.round(args.file.size*100)/100)+' '+fSExt[i];
            // console.log(exactSize);
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
        $scope.user = Youtube.getUser();
        console.log($scope.user.accessToken, $scope.clipSrc);
        postVideo($scope.user.accessToken, $scope.clipSrc);
    }

    // $scope.nowTimeToRock = function () {
    //     $ionicLoading.show();
    //     $scope.uploaded = 0;
        
    //     $scope.user = Youtube.getUser();
    //     var metadata = {
    //         snippet : {
    //             categoryId: '25',
    //             defaultLanguage: 'en',
    //             description: $scope.youtube.descrizione,
    //             tags: $scope.youtube.keyword.split(','),
    //             title: $scope.youtube.titolo,
    //         },
    //         status :{
    //             privacyStatus: "public",
    //         }              
    //     };
    //     var params = {'part': 'snippet,status'};
    //     // $scope.clipSrc = 'img/video.mp4';
    //     console.log($scope.clipSrc);
       
    //     Youtube.gapiSetToken($scope.user.accessToken);
    //     var uploader = new MediaUploader({
    //         baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
    //         file: $scope.clipSrc,
    //         token: $scope.user.accessToken,
    //         metadata: metadata,
    //         params: params,
    //         onError: function(data) {
    //             var message = data;
    //             try {
    //                 var errorResponse = JSON.parse(data);
    //                 message = errorResponse.error.message;
    //             } finally {
    //                 console.log(JSON.stringify(message));
    //             }
    //         },
    //         onProgress: function(data) {
    //             var currentTime = Date.now();
    //             console.log('Progress: ' + data.loaded + ' bytes loaded out of ' + data.total);
    //             var totalBytes = data.total;
    //             $scope.uploadingLeng = data;
    //             $scope.uploaded = Math.round((data.loaded * 100)/data.total);
    //             $scope.remaining = 100 - $scope.uploaded;
    //             console.log('Progress: ' + $scope.uploaded);                
    //         },
    //         onComplete: function(data) {
    //             // $scope.uploaded
    //             var uploadResponse = JSON.parse(data);
    //             console.log('Upload complete for video ' + uploadResponse.id);
    //             $ionicLoading.hide();
    //             console.log("Upload complete ");
    //             $scope.uploaded = 0;
    //             $ionicHistory.goBack();
    //         }
    //     });

    //     uploader.upload();
    // }
    function postVideo(accessToken, fileURI) {
        // var metadata = {
        //   snippet: {
        //     title: $scope.youtube.titolo,
        //     description: $scope.youtube.descrizione,
        //     tags: $scope.youtube.keyword.split(','),
        //     categoryId: 25
        //   },
        //   status: {
        //     privacyStatus: "public"
        //   }
        // }
        var params = {};
        params.snippet= {
            title: $scope.youtube.titolo,
            description: $scope.youtube.descrizione,
            tags: $scope.youtube.keyword.split(','),
            categoryId: 25
          };
        params.status = {
            privacyStatus: "public"
          }
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = 'test';
        options.mimeType = "video/quicktime";
        options.chunkedMode = false;
      
        options.headers = {
          Authorization: "Bearer " + accessToken,
          "Access-Control-Allow-Origin": "http://meteor.local"
        };
      
        var par = new Object();
        par.part = Object.keys(params).join(',')
        
        options.params = params;
        console.log(options)
        var ft = new FileTransfer();
        ft.upload(fileURI, "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status", win, fail, options, true);
      
        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
                // console.log(progressEvent)
                // loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
          } else {
            console.log('something not loading')
              // loadingStatus.increment();
          }
          console.log(progressEvent.loaded / progressEvent.total);
        };
      }
      
      function win(r) {
        // console.log(JSON.parse(r.response));
        var dat = JSON.parse(r.response);
        // if (r.response.snippet.title == "unknown" || r.response.snippet.title == "") {
            Youtube.gapiSetToken($scope.user.accessToken);
            Youtube.buildApiRequest('PUT',
                       '/youtube/v3/videos',
                       {'part': 'snippet,status'},
                       {   'id': dat.id,
                           'snippet' : {
                               'categoryId': '25',
                               'defaultLanguage': 'en',
                               'description': $scope.youtube.descrizione,
                               'tags': $scope.youtube.keyword.split(','),
                               'title': $scope.youtube.titolo,
                           },
                           'status' :{
                               'privacyStatus': "public",
                           }      
                   }).then(function(response){ 
                                   $ionicLoading.hide();
                                   alert("Successfully Saved");
                                   $ionicHistory.goBack();
                               }, function(error){ 
                                   $ionicLoading.hide();
                                   console.log(JSON.stringify(error));
                               });
        // }
      }
      
      function fail(error) {
        console.log(error)
          // alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
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
}])
.controller('YoutubeOperationEditCtrl', function($scope, $stateParams, $ionicHistory,$cordovaCamera, $ionicPopup, $ionicLoading, $cordovaToast, Youtube) {
    $ionicLoading.show();
    $scope.user = Youtube.getUser();
    Youtube.gapiSetToken($scope.user.accessToken);
    Youtube.buildApiRequest('GET',
            '/youtube/v3/videos',
            {
                'id': $stateParams.id,
                'part': 'snippet,statistics,status', 
            }).then(function(response){ 
                $scope.youtube = {
                    titolo : response.items[0].snippet.title,
                    descrizione : response.items[0].snippet.description,
                    keyword : response.items[0].snippet.tags,
                    privacy : response.items[0].status.privacyStatus,
                }
                // $scope.thumb = response.items[0].snippet.thumbnails.maxres.url;
                console.log(response);
                $ionicLoading.hide();
            }, function(error){ 
                console.log(JSON.stringify(error));
                $ionicLoading.hide();
            });
    $scope.id = $stateParams.id;
    $scope.updateData = function () {
        $ionicLoading.show();
        // Youtube.gapiSetToken($scope.user.accessToken);
        Youtube.googleAuth().then(
            function (authResult) {
              $scope.authResult = authResult;
              if ($scope.youtube.keyword.indexOf(',') > -1) {
                $scope.youtube.keyword = $scope.youtube.keyword.split(',');
              }
             Youtube.gapiSetToken($scope.user.accessToken);
             Youtube.buildApiRequest('PUT',
                        '/youtube/v3/videos',
                        {'part': 'snippet,status'},
                        {   'id': $scope.id,
                            'snippet' : {
                                'categoryId': '25',
                                'defaultLanguage': 'en',
                                'description': $scope.youtube.descrizione,
                                'tags': $scope.youtube.keyword,
                                'title': $scope.youtube.titolo,
                            },
                            'status' :{
                                'privacyStatus': $scope.youtube.privacy,
                            }      
                    }).then(function(response){ 
                                    $ionicLoading.hide();
                                    alert("Successfully Updated");
                                    $ionicHistory.goBack();
                                }, function(error){ 
                                    $ionicLoading.hide();
                                    console.log(JSON.stringify(error));
                                });
            },
            function (err) {
                $ionicLoading.hide();
                console.log(JSON.stringify(err));
            });       
        
    }
}).filter('youtubeTrusted', ['$sce', function ($sce) {
    return function(id) {
        return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + id);
    };
}]);;
 
// curl 'https://googleads.g.doubleclick.net/pagead/id?exp=nomnom' \
// -XGET \
// -H 'Referer: https://www.youtube.com/embed/DmeVCVpG0bw' \
// -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C107' \
// -H 'Origin: https://www.youtube.com' \
// -H 'Accept: */*'