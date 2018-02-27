// angular.module('youtube.controllers', [])

// .controller('YoutubeCtrl', function($timeout, $scope, Youtube, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaCapture, $cordovaToast, $location, $timeout,$http,ApiConfig, $state, Youtube,$ionicActionSheet){
//     console.log("YoutubeOperationCtrl");
//     $scope.googleSignIn = function() {
//         $ionicLoading.show({
//           template: 'Logging in...'
//         });
//         window.plugins.googleplus.login(
//             {
//                 'scopes': ApiConfig.gPScopes,
//                 'webClientId': '343547022633-rdrasefvqaf7l9snfs3o85biesg1gemc.apps.googleusercontent.com',
//                 'offline': false
//             },
//           function (user_data) {
//             localStorage.setItem("starter_google_user",user_data)
//             alert(JSON.stringify(user_data));
//             $scope.user = user_data;
//             $ionicLoading.hide();
//           },
//           function (msg) {
//             alert(JSON.stringify(msg));              
//             $ionicLoading.hide();
//           }
//         );
//       };
//     $scope.showLogOutMenu = function () {
//         window.plugins.googleplus.logout(
//             function (msg) {
//               alert(JSON.stringify(msg)); 
//             }
//           );
//     }
// })

// .controller('YoutubeOperationCtrl', function($scope, $stateParams, $ionicHistory,$cordovaCamera, $ionicPopup, $ionicLoading, $cordovaToast, Youtube) {
//     console.log("YoutubeOperationCtrl");

// }).filter('trusted', ['$sce', function ($sce) {
//     return function(url) {
//         return $sce.trustAsResourceUrl(url);
//     };
// }])
// .controller('YoutubeOperationEditCtrl', function($scope, $stateParams, $ionicHistory,$cordovaCamera, $ionicPopup, $ionicLoading, $cordovaToast, Youtube) {
//     console.log("YoutubeOperationEditCtrl");
// }).filter('youtubeTrusted', ['$sce', function ($sce) {
//     return function(id) {
//         return $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + id);
//     };
// }]);;
 
// // curl 'https://googleads.g.doubleclick.net/pagead/id?exp=nomnom' \
// // -XGET \
// // -H 'Referer: https://www.youtube.com/embed/DmeVCVpG0bw' \
// // -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C107' \
// // -H 'Origin: https://www.youtube.com' \
// // -H 'Accept: */*'

angular.module('youtube.controllers', [])

.controller('YoutubeCtrl', function($timeout, $scope, Youtube, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaCapture, $cordovaToast, $location, $timeout,$http,ApiConfig, $state, Youtube,$ionicActionSheet){
    $scope.news_list = [];
    $scope.isAvailable = true;
    
    var GoogleAuth;
    $scope.youtubeChannelList = {};
    $scope.authResult;
    // $scope.user = Youtube.getUser();
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
      $scope.delVideo = function (id,index){
          console.log(index);
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
                            // $scope.youtubeChannelList.splice(index,1);
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
    $scope.popOver = function (list){
        $scope.data = {};
        $scope.template = '<div class="row"><div class="col col-50"><div afkl-lazy-image="'+list.snippet.thumbnails.default.url+'" class="afkl-lazy-wrapper item-thumbnail-img"></div></div><div class="col col-50"><h3>'+list.snippet.title+'</h3><p>'+list.snippet.description+'</p></div></div>';
        // $scope.template = '<ion-item class="item-remove-animate item-thumbnail-left item-icon-right" ><div afkl-lazy-image="'+list.snippet.thumbnails.default.url+'" class="afkl-lazy-wrapper" style="margin-top: 10px;" item-thumbnail-img"></div><h2 style="margin-left: 10px;">'+list.snippet.title+'</h2><p  style="margin-left: 10px;">'+list.snippet.description+'</p><p  style="margin-left: 10px;">'+list.snippet.publishedAt +'| date:"dd/MM/yyyy "at" h:mma"</p></ion-item>';
        var myPopup = $ionicPopup.show({
        template: $scope.template,
        title: 'Gestisci video',
        scope: $scope,
        buttons: [
       { text: '<i class="icon ion-close-round"></i> ' 
         //close popup and do nothing
       },
       {
        text: '<i class="icon ion-trash-a"></i>',
        type: 'button-assertive',
        onTap: function(e) {  
           $scope.delVideo(list.id.videoId);
        }
       },
       {
        text: '<i class="icon ion-edit"></i> ',
        type: 'button-energized',
        onTap: function(e) { 
          $scope.edit(list);
        }
       }]
      });
    }
})

.controller('YoutubeOperationCtrl', function($scope, $stateParams, $ionicHistory,$cordovaCamera, $ionicPopup, $ionicLoading, $cordovaToast, Youtube) {
    $scope.defaultIcon = true;
    $scope.loadProgress = false;
    $scope.pageTitle = "Crea un Video";
    $scope.uploaded = 0;
    $scope.youtube = [];
    $scope.youtube.filename = 'http://files.overplace.com/bacheca/xl_overplace.png';
    $scope.clipSrc = new File();
    $scope.takeVideo = function () {
        // $ionicLoading.show();
        //     var captureSuccess = function(mediaFiles) {
        //         alert("Success");
        //         var i, path, len;
        //         $scope.defaultIcon = false;
        //             $ionicLoading.hide();
        //             console.log("TakeVideo");                    
        //             console.log("file://"+ mediaFiles[0].fullPath);
        //             // files = mediaFiles;
        //             $scope.clipSrc = "file://"+ mediaFiles[0].fullPath;
        //             $scope.clipSrc2 = "file://"+ mediaFiles[0].fullPath;
        //             // $scope.clipSrc = mediaFiles[0];
        //             // $scope.videoPath = mediaFiles[0].fullPath;
        //     };
        //     var captureError = function(error) {
        //         alert("Error =>" + JSON.stringify(error));
        //         $ionicLoading.hide();
        //         navigator.notification.console.log('Error code: ' + error.code, null, 'Capture Error');
        //     };
        //     navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:2});
        var captureSuccess = function(mediaFiles) {
            var i, path, len;
            $ionicLoading.hide();
            $scope.defaultIcon = false;
            $scope.clipSrc = mediaFiles[0].fullPath;
            $scope.clipSrc2 = mediaFiles[0].fullPath;
        };
        
        // capture error callback
        var captureError = function(error) {
            console.log(JSON.stringify(error));            
            navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
        };
        
        // start audio capture
        navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1, quality: 100 });
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
            $scope.clipSrc = args.file;
            $scope.clipSrc2 = cordova.file.tempDirectory+""+args.file.name;
            $scope.size = ((args.file.size / 1024)/1024).toFixed(2);
            $scope.defaultIcon = false;
            $ionicLoading.hide();
        });
    });
   
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

    function postVideo(accessToken, fileURI) {
    
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
        $scope.loadProgress = true;
        ft.upload(fileURI, "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status", win, fail, options, true);
        
        ft.onprogress = function(progressEvent) {
          if (progressEvent.lengthComputable) {
                $scope.loadProgress =((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
                console.log($scope.loadProgress);
                var elem = document.getElementById("myBar");   
                elem.style.width = $scope.loadProgress + '%'; 
                elem.innerHTML = $scope.loadProgress * 1  + '%';
                // loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
          } else {
            console.log('something not loading');
            $scope.loadProgress = false;
          }
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
                                   $ionicHistory.goBack();
                                   $ionicLoading.hide();
                                //    alert("Successfully Saved");
                                var myPopup = $ionicPopup.alert({
                                    title: 'Successo',
                                    template: "Aggiornato con successo"
                                 });  
                               }, function(error){ 
                                   $ionicLoading.hide();
                                   console.log(JSON.stringify(error));
                               });
        // }
      }
      
      function fail(error) {
        console.log(error);
        var myPopup = $ionicPopup.alert({
            title: 'Errore',
            template: "Qualcosa è andato storto. Per favore riprova più tardi"
        });
         $ionicLoading.hide();
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
    $scope.pageTitle = "Modifica video";
    $scope.user = Youtube.getUser();
    Youtube.gapiSetToken($scope.user.accessToken);
    Youtube.buildApiRequest('GET',
            '/youtube/v3/videos',
            {
                'id': $stateParams.id,
                'part': 'snippet,statistics,status', 
            }).then(function(response){ 
                if (response.items[0]) {
                    $scope.youtube = {
                        titolo : response.items[0].snippet.title || '',
                        descrizione : response.items[0].snippet.description || '',
                        keyword : response.items[0].snippet.tags || '',
                        // privacy : response.items[0].status.privacyStatus || '',
                    }
                }
                // $scope.thumb = response.items[0].snippet.thumbnails.maxres.url;
                console.log(response);
                $ionicLoading.hide();
            }, function(error){ 
                console.log(JSON.stringify(error));
                $ionicHistory.goBack();
                var myPopup = $ionicPopup.alert({
                    title: 'Errore',
                    template: "Qualcosa è andato storto. Per favore riprova più tardi"
                 }); 
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
                                'privacyStatus': "public",
                            }      
                    }).then(function(response){ 
                                    $ionicLoading.hide();
                                    var myPopup = $ionicPopup.alert({
                                        title: 'Successo',
                                        template: "Video caricato con successo"
                                    });
                                    $ionicHistory.goBack();
                                }, function(error){ 
                                    $ionicLoading.hide();
                                    var myPopup = $ionicPopup.alert({
                                        title: 'Errore',
                                        template: "Qualcosa è andato storto. Per favore riprova più tardi"
                                    });
                                    console.log(JSON.stringify(error));
                                    $ionicHistory.goBack();
                                });
            },
            function (err) {
                $ionicLoading.hide();
                var myPopup = $ionicPopup.alert({
                    title: 'Errore',
                    template: "Qualcosa è andato storto. Per favore riprova più tardi"
                });
                $ionicHistory.goBack();
                console.log(JSON.stringify(err));
            });      
    }
}).filter('youtubeTrusted', ['$sce', function ($sce) {
    return function(id) {
        return $sce.trustAsResourceUrl("https://www.youtube.com/embed/"+id+"?enablejsapi=1&rel=0");
    };
}]);;
 
// curl 'https://googleads.g.doubleclick.net/pagead/id?exp=nomnom' \
// -XGET \
// -H 'Referer: https://www.youtube.com/embed/DmeVCVpG0bw' \
// -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Mobile/15C107' \
// -H 'Origin: https://www.youtube.com' \
// -H 'Accept: */*'