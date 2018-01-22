angular.module("rubrica.services", [])

.factory("Rubrica", function($http, $q, $cordovaToast, $cordovaContacts, $ionicPopup, ApiConfig, Cache){
	var _this = this;
	
	_this.page = 1;
	_this.more = true;
	
	/*
	 * Lista dei contatti dal wmc
	 */
	Cache.wmcContactCache = [];
    Cache.wmcContactCacheId = {};
    
    /*
     * Lista dei contatti dal telefono
     */
    Cache.contactCache = [];
    Cache.contactCacheId = {};
    
    /**
     * Legge tutti i contatti presenti nel wmc
     */
    _this.readAll = function(){    	
    	var deferred = $q.defer();

    	var urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/rubrica/'+window.localStorage['id_scheda'];
    	var param = { operation: 'read' };
    	
    	$http({
            method: 'POST',
            url: 	urlApiHmac,
            data: 	JSON.stringify(param).replace(/\//g,'\\/'),
            cache: 	false,
            hmac: 	true
        }).success(function(data, status, headers, config){
        	if(data.hasOwnProperty('error') != false){
        		deferred.reject();
        	}else{
    			var arr_dataId = [],
    				wmcContactList = data['response'],
    				count = data['response'].length;
    			
    			for (var i = 0; i < count; i++){
    				wmcContactList[i].photos = new Array();
    				wmcContactList[i].photos.push('https://www.overplace.com/avatar/ovp/avatar_default.png');
    				
    				//verifica se esiste l'id in cache
    				if(Cache.wmcContactCacheId.hasOwnProperty(wmcContactList[i]['id'])){
    					//verifica se l'oggetto in cache è diverso da quello in arrivo dal server
    					var cache_obj = angular.extend({}, Cache.wmcContactCacheId[wmcContactList[i]['id']]),
    						server_obj = angular.extend({}, wmcContactList[i]);
    					
    					delete cache_obj.$$hashKey;
    					delete server_obj.$$hashKey;
    					
    					if (!equals(cache_obj, server_obj, false)){
    						//aggiorna l'oggetto in cache
    						var id_wmcContactCache = Cache.wmcContactCache.indexOf(Cache.wmcContactCacheId[wmcContactList[i]['id']]);
    						Cache.wmcContactCache[id_wmcContactCache] = wmcContactList[i];
    						Cache.wmcContactCacheId[wmcContactList[i]['id']] = wmcContactList[i];
    					}
    				}else{
    					if (wmcContactList[i].telefono != '' || wmcContactList[i].email != ''){
    						Cache.wmcContactCacheId[wmcContactList[i]['id']] = wmcContactList[i];
    						Cache.wmcContactCache.push(wmcContactList[i]);
    					}
    				}

    				arr_dataId.push(wmcContactList[i]['id']);
    			}
    			
    			//rimuove dalla cache i dati non più presenti
    			for (var id in Cache.wmcContactCacheId){
    				if (arr_dataId.indexOf(id) == -1){
    					Cache.wmcContactCache.splice(Cache.wmcContactCache.indexOf(Cache.wmcContactCacheId[id]), 1);
    					delete Cache.wmcContactCacheId[id];
    				}
    			}
    			
    	        deferred.resolve(Cache.wmcContactCache);
        	}
        })
        .error(function(data, status, headers, config){
        	deferred.reject({ code: 1, message: "Impossibile recuperare i contatti dal wmc." });
        });
    	
    	return deferred.promise;
    }
    
    
    /**
	 * Legge i contatti del telefono
	 */
	_this.readContact = function(){
		var deferred = $q.defer();
		
		$cordovaContacts
			.find({ multiple: true })
			.then(function (contatti){
				var lenContatti = contatti.length;
			
				if (lenContatti == 0){
					deferred.reject({ code: 2, message: "Nessun contatto presente" });
				}else {
					var lista = new Array(),
						contatto,
						listNumbers,
						listEmails,
						listPhotos,
						displayName;
					
					for (var i = 0; i < lenContatti; i++){
						contatto = contatti[i];
						
						//Se il contatto non ha almeno un numero di telefono o almeno un indirizzo email escludo il contatto
						if (contatto.phoneNumbers == null && contatto.emails == null){ continue; }
						
						listNumbers = new Array();
						listEmails = new Array();
						listPhotos = new Array();
						
						if (contatto.phoneNumbers != null){
							for (var k = 0; k < contatto.phoneNumbers.length; k++){ listNumbers.push(contatto.phoneNumbers[k].value.split(" ").join("")); }	
						}
						
						if (contatto.emails != null){
							for (var k = 0; k < contatto.emails.length; k++){ listEmails.push(contatto.emails[k].value); }	
						}
						
						if (contatto.photos != null){
							for (var k = 0; k < contatto.photos.length; k++){ listPhotos.push(contatto.photos[k].value); }
						}else {
							listPhotos.push('https://www.overplace.com/avatar/ovp/avatar_default.png');
						}
						
						if (listNumbers.length == 0 && listEmails.length == 0){ continue; }
						
						if (ionic.Platform.isIOS()){
							displayName = "";
							
							if (contatto.name.givenName != null){
								displayName += contatto.name.givenName + " ";
							}
							
							if (contatto.name.middleName != null){
								displayName += contatto.name.middleName + " ";
							}
							
							if (contatto.name.familyName != null){
								displayName += contatto.name.familyName;
							}
						}else {
							displayName = contatto.displayName;
						}
						
						if (displayName == null || displayName == ""){
							displayName = (listEmails.length > 0) ? listEmails[0] : listNumbers[0];
						}
						
						
						lista.push({
							id: 		contatto.id,
							name: 		displayName,
							numbers: 	listNumbers,
							emails: 	listEmails,
							photos:		listPhotos,
							status: {
								telefono: false,
								email: false,
								checked: false
							}
						});
						
					}
					(lista.length > 0) ? deferred.resolve(lista) : deferred.reject({ code: 3, message: "Nessun contatto valido." });
				}
			}, function(error){
				deferred.reject({ code: 4, message: "Impossibile recuperare i contatti dal dispositivo." });
			});
		
		return deferred.promise;
	}
    
	
	return {
		
		upload: function (contatti){
			var q = $q.defer(),
				urlApiHmac = ApiConfig.ovpEndpointHmac+'app/post/rubrica/'+window.localStorage['id_scheda'],
				param = { operation: 'upload', contatti: contatti };
	    	
	    	$http({
	            method: 'POST',
	            url: 	urlApiHmac,
	            data: 	JSON.stringify(param).replace(/\//g,'\\/'),
	            cache: 	false,
	            hmac: 	true
	        }).success(function(data, status, headers, config){
	        	if (data.hasOwnProperty('error') != false){
	        		q.reject();
	        	}else {
	        		q.resolve();
	        	}
	        })
	        .error(function(data, status, headers, config){
	        	q.reject();
	        });
	    	
	    	return q.promise;
			
		},
		
		sincro: function(){
			var list = new Array(),
				deferred = $q.defer();
			
			_this.readContact().then(function(phoneContacts){
				_this.readAll().then(function(wmcContacts){
					var lenPhoneContacts = phoneContacts.length,
						lenWmcContacts = wmcContacts.length;
					
					if (lenWmcContacts == 0){
						list = phoneContacts;
					}else {
						var contatto,				//Il contatto del telefono
							numeri = new Array(),	//qui salvo temporaneamente i numeri validi del contatto
							emails = new Array(),	//qui salvo temporaneamente le email valide del contatto
							bool,					//Boolean per indicare se il numero o email del contatto è presente nel web media center
							numero,					//Numero di telefono del contatto
							numeroWmc,				//Numero del contatto presente nel web media center
							email,					//Email del contatto
							emailWmc,				//Email del contatto presente nel web media center
							i,						//contatore
							j,						//contatore
							k;						//contatore
						
						//Ciclo i contatti presi dal telefono.
						for (i = 0; i < lenPhoneContacts; i++){
							//Inizializzo
							contatto = phoneContacts[i];
							numeri = new Array();
							emails = new Array();
							
							//Ciclo i numeri di telefono presenti nel contatto
							for (j = 0; j < contatto.numbers.length; j++){
								
								//Assegnazione numero contatto
								numero = contatto.numbers[j];
								
								//Verifico che il numero non sia una stringa vuota
								if (numero == '' || numeri.indexOf(numero) !== -1){
									//Passo al numero successivo
									continue;
								}
								
								//Di default considero che il numero non sia nel wmc
								bool = true;
								
								//Ciclo i contatti del wmc
								for (k = 0; k < lenWmcContacts; k++){
									//Assegnazione numero wmc
									numeroWmc = wmcContacts[k].telefono;
									
									//Verifico se il numero del contatto è uguale al numero di un contatto all'interno del wmc
									if (numero == numeroWmc){
										//Numero già presente nel wmc, cambio il flag ed esco dal ciclo
										bool = false;
										break;
										//if (wmcContactsToDelete.numeri.indexOf(k) === -1){ wmcContactsToDelete.numeri.push(k); }
									}
								}
								
								//Verifico se il numero del contatto è da aggiungere.
								if (bool){ numeri.push(numero); }
								
							}
							
							//Ciclo le email del contatto
							for (j = 0; j < contatto.emails.length; j++){
								//Assegno l'email del contatto
								email = contatto.emails[j];
								
								//Verifico se l'email è una stringa vuota
								if (email == '' || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){
									//Passo all'email successiva
									continue;
								}
								
								//Di default considero che l'email non è presente nel wmc
								bool = true;
								
								//Ciclo i contatti del wmc
								for (k = 0; k < lenWmcContacts; k++){
									//Assegnazione email wmc
									emailWmc = wmcContacts[k].email;
									
									//Verifico se l'email del contatto è uguale all'email di un contatto caricato nel wmc
									if (email == emailWmc){
										//Email presente, cambio il flag ed esco dal ciclo
										bool = false;
										break;
									}
									
								}
								
								//Verifico se l'email del contatto è da aggiungere
								if (bool){ emails.push(email); }
								
							}
							
							//Verifico se il contatto ha almeno un numero di telefono o email non presente nel wmc
							if (numeri.length > 0 || emails.length > 0){
								//Aggiungo il contatto
								list.push({
									id: 		contatto.id,
									name: 		contatto.name,
									numbers: 	numeri,
									emails: 	emails,
									photos:		contatto.photos,
									status: 	contatto.status
								});
							}
							
						}
						//fine ciclo contatti						
					}
					
					list.sort(function (a, b){
						var name1 = a.name.toLowerCase(),
							name2 = b.name.toLowerCase();
						
						if (name1 < name2){ return -1; }
						if (name1 > name2){ return 1; }
						return 0;
					});
					
					deferred.resolve(list);
				}, function(error){
					list = phoneContacts;
				});
			}, function(error){
				deferred.reject(error);	
			});
			
			return deferred.promise;
		},
		
		saveContact: function(contatto){
			var deferred = $q.defer();
			
			var contactToSave = {
				displayName: contatto.nome,
				phoneNumbers: [{type: "mobile", value: contatto.telefono}],
				emails: [{type: "other", value: contatto.email}]
			};
			
			$cordovaContacts.save(contactToSave).then(function(result){
				delete Cache.wmcContactCacheId[contatto.id];
				Cache.wmcContactCache.splice(Cache.wmcContactCache.indexOf(contatto), 1);
				
				deferred.resolve(true);
				$cordovaToast.show('Contatto salvato!','short','bottom');
			}, function(error){
				deferred.resolve(false);
				$cordovaToast.show('Errore nel salvataggio del contatto!','short','bottom');
			});
			
			return deferred.promise;
		}
	}
	
	
})