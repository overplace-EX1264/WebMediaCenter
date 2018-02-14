angular.module('chat.controllers', [])

.controller('ChatCtrl', function($scope, $rootScope, $ionicLoading, Auth, Chats, Help) {
	
	var userData = Auth.getUserData(null);
	
	$scope.moduloChat = userData.wmc_data.chat;
	$scope.isSupport = Object.keys(userData.support).length > 0;
	
	if($scope.isSupport){
		$scope.support_phone = userData.support.phone;
	}

	if(!$scope.moduloChat){
    	$scope.inactive = Help.getModulo('chat');
	}else{
		
		$ionicLoading.show({
		    content: 'Loading Data',
		    animation: 'fade-in',
		    showBackdrop: false,
		    maxWidth: 200
		});
		
	    $scope.Loading = true;
		
		Chats.all().then(
	        function(chats) {
	            $ionicLoading.hide();
	            $rootScope.chats = chats;
	        }
	    );
	}

	$scope.call = function(phone){
		window.location.href = 'tel:'+phone;
	};

    $scope.$watch($scope.chats, function(){
    	$scope.Loading = false;
    });

    $scope.minusCounter = function(channel){
        Chats.minusCounter(channel);
    }

    $scope.remove = function(chat){
        Chats.minusCounter(chat.channelReference);
        Chats.remove(chat);
    }
    
})

.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicScrollDelegate, $timeout, $state, $cordovaToast, Auth, Chats) {

	var userData = Auth.getUserData(null);
	
    var chatView = '';

    $scope.myResponse = "";
    $scope.currentChannel = "";

    if($state.current.name == 'app.chat-read' && $stateParams.channelReference !== undefined){
        $scope.currentChannel = $stateParams.channelReference;
    }

    $scope.talk = Chats.get($stateParams.channelReference);
    $scope.chatName = Chats.getName($stateParams.channelReference);

    $timeout(function(){
        $ionicScrollDelegate.scrollBottom();
    }, 1);
    
    $scope.sendResponse = function(message){
        if($scope.myResponse !== ''){
        	$scope.myResponse = '';
            var chatInfo = {
                nickname: userData.nickname,
                text: message,
                avatar: '//www.overplace.com/avatar/'+userData.avatar
      	    };
            Chats.sendResponse(chatInfo, $stateParams.channelReference);
       }
    }

    /*$scope.delete = function(chat){
       Chats.delete(chat);
       Chats.minusCounter(chat.channelReference);
    }*/

    $scope.$on('newMessage', function(f, cname){
        if($state.current.name == 'app.chat-read' && cname == $scope.currentChannel){
        	Chats.minusCounter(cname);
            Chats.resetPending($scope.currentChannel);
            $ionicScrollDelegate.scrollBottom(true);
        }

    });

    $scope.$on('chatClosed', function(f, cname){
        if($state.current.name == 'app.chat-read' && cname ==  $scope.currentChannel){
            $cordovaToast.show('Chat interrotta', 'short', 'bottom');
            Chats.minusCounter(cname);
        }
    });

})