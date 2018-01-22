angular.module('chat.services', [])

.factory('Chats', function($http, $cordovaLocalNotification, $cordovaToast, $cordovaMedia, ApiConfig, NavBadges, Cache, $pusher, $rootScope, $timeout, $q) {

    var client;
    var _self = this;
    var chat_initialized = false;

    this.pusherChat = function(pusher){
      if(window.localStorage['chatAvailable'] === undefined || window.localStorage['chatAvailable'] !== 'true' || window.localStorage['chat'] == '0'){
    	  client.disconnect();
    	  return false;
      }
      var _self = this;
      this._pusher = pusher;
      this._chatChannel = [];
      this._messagesData = {};
      this._chats = [];
      this._chatsName = [];
      this._conversazioni = [];
      this._heartBeat;

      this._storageConversazioni = [];
      this._liveChannels = [];
      //Canali recuperati in seguito a sottoscrizione canale presenza
      this._rec_messages = [];

      this._userList = [];
      this._orphanChannels = [];
      this._unsubscribePending = [];
      this._myUserID;
      
      var presence_channel = pusher.subscribe('presence-'+window.localStorage['id_scheda']);
      var notification_channel = pusher.subscribe('private-chat-'+window.localStorage['id_scheda']);

      presence_channel.bind('pusher:subscription_succeeded', function(members){
          _self._storageConversazioni = window.localStorage['storageConversazioni'] !== undefined ? JSON.parse(window.localStorage['storageConversazioni']) : [];
          _self._myUserID = members.me.id;

          if(members.count > 1){
              for(var user_id in members.members){
                  if(user_id !== members.me.id){
                     var cname = 'private-ovp-chat-'+window.localStorage['id_scheda']+'-'+user_id;

                     var iof = _self._orphanChannels.indexOf(cname);
                     var iop = _self._unsubscribePending.indexOf(cname);

                     if(iof > -1) _self._orphanChannels.splice(iof,1);
                     if(iop > -1) _self._unsubscribePending.splice(iop,1);

                     if(_self._chatChannel[cname] === undefined){
                        _self._liveChannels.push(cname);
                        _self.initializeChat(cname);
                     }
                  }
              }
          }

          notification_channel.bind('ovp-chat-'+window.localStorage['id_scheda'], function(data){
               if( data.chat_with === _self._myUserID) {
                   var iof = _self._orphanChannels.indexOf(data.channel_name);
                   var iop = _self._unsubscribePending.indexOf(data.channel_name);

                   if(iof > -1) _self._orphanChannels.splice(iof,1);
                   if(iop > -1) _self._unsubscribePending.splice(iop,1);

                   if(_self._chatChannel[data.channel_name] === undefined){
                      _self._liveChannels.push(data.channel_name);
                      _self.initializeChat(data.channel_name);
                   }
               }
          });
          
          for(var cn in _self._storageConversazioni){
            if(_self._liveChannels.indexOf(_self._storageConversazioni[cn]) === -1){
              _self._orphanChannels.push(_self._storageConversazioni[cn]);
              _self.initializeChat(_self._storageConversazioni[cn]);
            }
            //_self._chats = _self._chats.reverse();
          }

      });

      presence_channel.bind('pusher:member_removed', function(member){
          var cname = 'private-ovp-chat-'+window.localStorage['id_scheda']+'-'+member.id;
          _self._unsubscribePending.push(cname)
          $timeout(function(){
            var iop = _self._unsubscribePending.indexOf(cname)
            var iol = _self._liveChannels.indexOf(cname) !== -1;
            if(iop > -1){
                _self._unsubscribePending.splice(iop, 1);
                _self._pusher.unsubscribe(cname);
                _self._orphanChannels.push(cname);
            }
            if(iol > -1){
                _self._liveChannels.splice(iol, 1);
            }
          },15000)
      });

      (function chatPing(){
      	_self._heartBeat = setTimeout(function(){
      		for(var channel in _self._chatChannel){
      		    if(_self._liveChannels.indexOf(channel) !== -1){
                    _self._chatChannel[channel].trigger('client-esercente-ping', {'ping' : true, 'ios' : true});
      		    }
      		}
      		chatPing();
      	},5000);
      })();
    }

    this.pusherChat.prototype._unsubscribeChannels = function(){
        var _this = this;
        
        if(_this._pusher !== undefined && _this._pusher.unsubscribe !== undefined){
        	
        	_this._pusher.unsubscribe('presence-'+window.localStorage['id_scheda']);
        	_this._pusher.unsubscribe('private-chat-'+window.localStorage['id_scheda']);
        	for(var channel in this._chatChannel){
        		var userId = channel.split('-')[4]; 
        		_this.resetChannel(channel, userId);
        		_this._pusher.unsubscribe(channel);
        	}
        	clearTimeout(_this._heartBeat);
        }
    }
    
    this.pusherChat.prototype._breakChat = function(){
    	var _this = this;
    	if(_this._pusher !== undefined && _this._pusher.unsubscribe !== undefined){
    		
    		_this._pusher.unsubscribe('presence-'+window.localStorage['id_scheda']);
    		_this._pusher.unsubscribe('private-chat-'+window.localStorage['id_scheda']);
    		for(var channel in this._chatChannel){
    			_this._pusher.unsubscribe(channel);
    		}
    		clearTimeout(_this._heartBeat);
    	}
    }

    this.pusherChat.prototype.chatInstances = [];

    this.pusherChat.prototype.initializeChat = function(channel) {
      var self = this,
      userLoggedIn = true;
      this.chatInstances.push(this);
      this._chatChannel[channel] = this._pusher.subscribe(channel);
      this._chatChannel[channel].bind('pusher:subscription_succeeded', function(members){
    	  self._chatChannel[channel].trigger('client-esercente-ping', {'ping' : true, 'ios' : true});
    	  if(window.localStorage[channel] !== undefined){
    		  var items = JSON.parse(window.localStorage[channel]);
    		  for(var i in items){
    			  if(self._rec_messages.indexOf(items[i].id) == -1){
        			  self._rec_messages.push(items[i].id);
        			  self._chatMessageReceived(items[i], true);
        		  }
    		  }
    	  }
    	  
    	  if(window.localStorage['chatsPending-'+channel] === undefined){
    		  window.localStorage['chatsPending-'+channel] = 0;
    	  }
    	  
    	  self._chatChannel[channel].bind('chat_message_'+channel, function(data) {
    		  if(window.localStorage['opened_'+data.channel_name] !== undefined){
    			  window.localStorage.removeItem('opened_'+data.channel_name);
    		  }
    		  
    		  if(window.localStorage['chatsPending-'+data.channel_name] === undefined){
    			  window.localStorage['chatsPending-'+data.channel_name] = 0;
    		  }else{
    			  window.localStorage['chatsPending-'+data.channel_name]++;
    		  }
    		  if(self._rec_messages.indexOf(data.id) == -1){
    			  self._rec_messages.push(data.id);
    			  self._chatMessageReceived(data);
    		  }
    	  });
    	  
    	  self._chatChannel[channel].bind('pusher:subscription_error', function(members){
    		  $cordovaToast.show('Impossibile abilitare la chat', 'long', 'center');
    	  });
    	  
    	  self._chatChannel[channel].bind('close_'+channel, function(data) {
    		  $rootScope.$broadcast('chatClosed', channel);
    		  self._orphanChannels.push(channel);
    	  });
      });
    };

    this.pusherChat.prototype._chatMessageReceived = function(data, mem){
      if(this._messagesData[data.channel_name] === undefined){
        this._messagesData[data.channel_name] = [];
      }

      if(this._storageConversazioni.indexOf(data.channel_name) === -1){
        this._storageConversazioni.push(data.channel_name);
        window.localStorage['storageConversazioni'] = JSON.stringify(this._storageConversazioni);
      }

      if(typeof(data.sender) == 'undefined') data['sender'] = 'user';
      if(mem == null){
        if(data.sender !== 'me' && window.runningBg == 0){
        	var media = $cordovaMedia.newMedia('/sound/notification.mp3');
            media.setVolume(0.3);
            media.play();
        }
      }
      
      var oci = this._orphanChannels.indexOf(data.channel_name);
      if(oci > -1){
    	  this._orphanChannels.splice(oci, 1);
      }

      Dt = new Date(Date.parse(data.published.replace(/-/g, '/'))),

      data.pubHour = ('0' + Dt.getHours()).slice(-2)+':'+('0' + Dt.getMinutes()).slice(-2);
      data.actor.image.url = data.actor.image.url.replace('http:', '');

      this._messagesData[data.channel_name].push(data);
      
      window.localStorage.removeItem(data.channel_name);
      window.localStorage.setItem(data.channel_name, JSON.stringify(this._messagesData[data.channel_name]));


      var userId = data.channel_name.split('-')[4],
      indexUser = this._userList.indexOf(userId),
      calDate = ('0' + Dt.getDay()).slice(-2)+'/'+('0' + (Dt.getMonth()+1)).slice(-2)+' '+('0' + Dt.getHours()).slice(-2)+':'+('0' + Dt.getMinutes()).slice(-2);

      var d_today = new Date();
      var d_yesterday = new Date(new Date().setDate(d_today.getDate() -1));

      var printDate = ('0' + Dt.getDate()).slice(-2)+'/'+('0' + (Dt.getMonth()+1)).slice(-2)+'/'+Dt.getFullYear();

      if(Dt.toDateString() == d_today.toDateString()){
    	  printDate = ('0' + Dt.getHours()).slice(-2)+':'+('0' + Dt.getMinutes()).slice(-2);
      }else if (Dt.toDateString() == d_yesterday.toDateString()){
    	  printDate = 'IERI';
      }

      if(indexUser == -1){

        this._chats.push({
          'name' : data.actor.displayName,
          'avatar' : data.actor.image.url,
          'lastDate' : calDate,
          'lastTime' : Dt.getTime(),
          'printDate' : printDate,
          'lastMessage': data.body.length > 50 ? data.body.substring(0,35) + '...' : data.body,
          'channelReference' : data.channel_name,
          'toRead' : window.localStorage['opened_'+data.channel_name] === undefined ? true : false,
          'pending' : window.localStorage['chatsPending-'+data.channel_name],
          'userId' : userId
        });

        this._chatsName[data.channel_name] = data.actor.displayName;

        this._userList.push(userId);
      }else{

        this._chats[indexUser].lastMessage = data.body.length > 35 ? data.body.substring(0,35) + '...' : data.body;
        this._chats[indexUser].lastDate = calDate;
        this._chats[indexUser].lastTime = Dt.getTime();
        this._chats[indexUser].printDate = printDate,
        this._chats[indexUser].channelReference = data.channel_name;
        this._chats[indexUser].pending = window.localStorage['chatsPending-'+data.channel_name];
        if(!this._chats[indexUser].toRead && window.localStorage['opened_'+data.channel_name] === undefined && data.sender !== 'me'){
            this._chats[indexUser].toRead = true;
        }
      }

      //Imposta la posizione dell'utente che ha inviato l'ultimo messaggio in cima alla lista
      if(mem == null){
        
    	var iu = indexUser == -1 ? (this._chats.length-1) : indexUser;
    	var current_chat = this._chats[iu]
    	this._chats.splice(iu, 1);
    	this._chats.unshift(current_chat);

        this._userList.splice(iu, 1);
        this._userList.unshift(userId);
      }

      this._conversazioni[data.channel_name] = this._messagesData[data.channel_name];
      if(window.runningBg !== undefined && window.runningBg == 1){
        this.notify(data);
      }
      $rootScope.$broadcast('newMessage', data.channel_name);
  };

  this.pusherChat.prototype.resetChannel = function(cname, userId) {
      var _this = this;
      var param = {
        'channel' : cname,
        'operation' : 'close_chat',
        'closer' : 'Esercente'
      };
      var urlApi = ApiConfig.ovpEndpoint+'chat';
      param[ApiConfig.wsKey] = 'JSON_CALLBACK';

      $http({
          method: 'JSONP',
          url: urlApi,
          params : param
      })
      .success(function(data, status, headers, config){
        _this._pusher.unsubscribe(cname);
        delete _this._chatChannel[cname];
        delete _this._messagesData[cname]
        window.localStorage.removeItem(cname);

        _this._storageConversazioni.splice(_this._storageConversazioni.indexOf(cname), 1);
        window.localStorage['storageConversazioni'] = JSON.stringify(_this._storageConversazioni);

        window.localStorage.removeItem('opened_'+cname);
        window.localStorage.removeItem('chatsPending-'+cname);
        _this._userList.splice(_this._userList.indexOf(userId),1);
        _this._liveChannels.splice(_this._liveChannels.indexOf(cname),1);

      })
      .error(function(data, status, headers, config){
          $cordovaToast.show('Impossibile chiudere la conversazione, errore di connessione', 'long', 'center');
      })
  };

  this.pusherChat.prototype.notify = function(event){

    $cordovaLocalNotification.schedule({
        id: parseInt(new Date().getTime()),
        title: 'Nuovo chat da '+event.actor.displayName,
        icon: 'iconb_large',
        smallIcon: 'ic_notification_50',
        message: event.body
    });

  }

  this.pusherChat.prototype._sendResponse = function(chatInfo, channel){
     var _this = this;
     if(this._orphanChannels.indexOf(channel) > -1){
        $cordovaToast.show('Utente non connesso', 'long', 'center');
        return;
     }
     chatInfo['sender'] = 'me';
     var param = {
       'chat_info': JSON.stringify(chatInfo),
       'channel' : channel,
       'id_scheda' : window.localStorage['id_scheda'],
       'operation' : 'chat'
     };
     var urlApi = ApiConfig.ovpEndpoint+'chat';
     param[ApiConfig.wsKey] = 'JSON_CALLBACK';
       $http({
         method: 'JSONP',
         url: urlApi,
         params : param
     })
     .success(function(data, status, headers, config){
     })
     .error(function(data, status, headers, config){
         $cordovaToast.show('Impossibile inviare il messaggio', 'long', 'center');
      })
     .then(function(response){
         _this._chatChannel[channel].trigger('client-esercente-ping', {'ping' : true, 'ios' : true});
     });
  }

  this.pusherChat.prototype._resetPending = function(channelReference){
        window.localStorage['chatsPending-'+channelReference] = 0;
        var userId = channelReference.split('-')[4];
        var indexUser = this._userList.indexOf(userId);
        if(indexUser != -1) this._chats[indexUser].pending = 0;
  }

  var widget = {};

  return {
    init : function(){
      if(!chat_initialized){
    	  client = new Pusher("11e7092aade616c4be28",{
    		  authTransport: 'jsonp',
    		  authEndpoint: 'http://www.overplace.com/my/esercente_chat_app_auth.php'
    	  }
    	  );
    	  var pusher = $pusher(client);
    	  widget = new _self.pusherChat(pusher);
    	  chat_initialized = true;
      }
    },
    all: function(){
	  var deferred = $q.defer();
      $timeout(function(){
    	  deferred.resolve(widget._chats);
      },1000);
      return deferred.promise;  
    },
    remove: function(chat){
      widget._chats.splice(widget._chats.indexOf(chat), 1);
      widget.resetChannel(chat.channelReference, chat.userId);
    },
    minusCounter : function(channelReference) {
      window.localStorage['opened_'+channelReference] = true;
    },
    get: function(channelReference) {
        widget._resetPending(channelReference);
        return widget._conversazioni[channelReference];
    },
    getName: function(channelReference) {
       return widget._chatsName[channelReference];
    },
    sendResponse : function(response, channelReference){
      if(widget._conversazioni[channelReference] !== undefined){
        return widget._sendResponse(response, channelReference);
      }
    },
    resetPending : function(channelReference){
        widget._resetPending(channelReference);
    },
    unsubscribeChannels : function(){
        widget._unsubscribeChannels();
        client.disconnect();
        chat_initialized = false;
        return true;
    },
    breakChat : function(){
    	//widget._breakChat();
    	widget._unsubscribeChannels();
    	client.disconnect();
    	chat_initialized = false;
    },
    addChat : function(nchats){
    	var nr = nchats.length;
    	for(var i = 0; i < nr; i++){
    		notifica = nchats[i];
    		
    		var cname = notifica.channel_name;
    		var channel = (window.localStorage[cname] !== undefined) ? JSON.parse(window.localStorage[cname]) : [];
    		channel.push(notifica);
    		window.localStorage[cname] = JSON.stringify(channel);
    		
    		var storage = (window.localStorage['storageConversazioni'] !== undefined) ? JSON.parse(window.localStorage['storageConversazioni']) : [];
    		
    		if(storage.indexOf(cname) === -1){
    			storage.push(cname);
    			window.localStorage['storageConversazioni'] = JSON.stringify(storage);
    		}
    		
    		if(window.localStorage['chatsPending-'+cname] === undefined){
    			window.localStorage['chatsPending-'+cname] = 1;
    		}else{
    			window.localStorage['chatsPending-'+cname]++;
    		}
    		
    	}
    	chat_initialized = false;
    }
  };
});