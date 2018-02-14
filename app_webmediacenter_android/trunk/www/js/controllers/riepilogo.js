angular.module('riepilogo.controllers', [])

.controller('RiepilogoCtrl', function($scope, $ionicPopup, $ionicLoading, $cordovaToast, Auth, Riepilogo){

	$ionicLoading.show({
		template: '<ion-spinner></ion-spinner>',
		noBackdrop: false
	});
	Riepilogo.getList().then(function (list){
		$ionicLoading.hide();
		$scope.riepilogo = list;
	}, function (e){});
	$scope.wmc = Auth.getUserData('wmc_data');

	$scope.periodo = {
		months: 0,
		personalized: false
	};

	$scope.refresh = function(){
		Riepilogo.refreshList().then(function(response){
			$scope.riepilogo = response;
			$scope.$broadcast('scroll.refreshComplete');
		}, function(error){
			$scope.$broadcast('scroll.refreshComplete');
		});
	};

	$scope.selectDate = function(){
		var confirmPopup = $ionicPopup.confirm({
			title: 'Periodo',
			templateUrl: "templates/partial/riepilogo/select_date.html",
			scope: $scope,
			okText: 'Ok',
			cancelText : 'Annulla'
		});

		confirmPopup.then(function(ok){
			if(ok){
				$ionicLoading.show({
					template: '<ion-spinner></ion-spinner>',
					noBackdrop: false
				});

				var months = $scope.periodo.months - 1;

				Riepilogo.changePeriod(months).then(function(response){
					$ionicLoading.hide();
					$scope.riepilogo = response;
				}, function(error){
					$ionicLoading.hide();
					$cordovaToast.show('Errore nella modifica del periodo','short','bottom');
				});
			}
		});
	}

})

.controller('RiepilogoDetailCtrl', function($scope, $stateParams, Auth, Riepilogo){

	var userData_support = Auth.getUserData('support');
	
	var name = $stateParams.name;

	$scope.isSupport = Object.keys(userData_support).length > 0;

	if($scope.isSupport){
		$scope.support_phone = userData_support.phone;
		$scope.support_email = userData_support.email;
	}

	$scope.riepilogo = Riepilogo.get(name);

	$scope.call = function(phone){
		window.location.href = 'tel:'+phone;
	};

	$scope.email = function(email){
		window.location.href = 'mailto:'+email;
	};

	switch (name){
		case "news":
			if ($scope.riepilogo.esito < 40){
				$scope.riepilogo.frase = "Attenzione &egrave; molto importante &ldquo;parlare&rdquo; con i clienti e potenziali clienti... se non hai avuto tempo, cerca di trovarlo, se non lo fai tu, lo far&agrave; qualcun &ldquo;altro&rdquo;! Crea subito una news o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma non hai &ldquo;parlato&rdquo; abbastanza con i clienti e potenziali clienti... comunicare costantemente migliorer&agrave; le tue relazioni commerciali, cerca di aumentare la frequenza. Crea subito una notizia o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai curando al meglio le tue relazioni commerciali...! Continua cos&igrave; e ricorda che la qualit&agrave; della tua comunicazione influenza i tuoi affari.";
			}

			$scope.riepilogo.titolo= "News";
			$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " news su " + $scope.riepilogo.soglie;
			$scope.riepilogo.icon = "fa-quote-left";
		break;
		case "eventi":
			if ($scope.riepilogo.esito < 40){
				$scope.riepilogo.frase = "Attenzione &egrave; molto importante &ldquo;coinvolgere e fidelizzare&rdquo; i clienti e potenziali clienti... se non hai avuto tempo, cerca di trovarlo, crea subito il tuo prossimo evento o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma non hai &ldquo;coinvolto e fidelizzato&rdquo; abbastanza i clienti e potenziali clienti... comunicare costantemente migliorer&agrave; le tue relazioni commerciali, cerca di aumentare la frequenza. Crea subito un evento o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai coinvolgendo e fidelizzando i tuoi clienti al meglio! Continua cos&igrave; e ricorda che il cliente fidelizzato &egrave; il tuo miglior sponsor.";
			}

			$scope.riepilogo.titolo= "Eventi";

			if ($scope.riepilogo.dati == 1){
				$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " evento su " + $scope.riepilogo.soglie;
			}else {
				$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " eventi su " + $scope.riepilogo.soglie;
			}

			$scope.riepilogo.icon = "fa-bullhorn";
		break;

		case "promozioni":
			if ($scope.riepilogo.esito < 40){
        		$scope.riepilogo.frase = "Attenzione &egrave; molto importante &ldquo;fare promozioni&rdquo;! I clienti e potenziali clienti desiderano essere premiati quando ti scelgono o tornano da te... se non hai avuto tempo, cerca di trovarlo... o qualcun &ldquo;altro&rdquo; premier&agrave; i tuoi clienti! Crea subito la tua promozione o contatta subito il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma non hai incentivato e premiato al meglio i tuoi clienti e potenziali clienti... Promuovere e aggiornare le proprie offerte, aumenta la frequenza di acquisto e la fedelt&agrave;. Crea subito una promozione o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai sfruttando al meglio lo strumento delle promozioni! Continua cos&igrave; e ricorda che i clienti amano ottenere dei privilegi.";
			}

			$scope.riepilogo.titolo= "Promozioni";
			if ($scope.riepilogo.dati == 1){
				$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " promozione su " + $scope.riepilogo.soglie;
			}else {
				$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " promozioni su " + $scope.riepilogo.soglie;
			}

			$scope.riepilogo.icon = "fa-trophy";
		break;
		case "coupon":
			if ($scope.riepilogo.esito < 40){
	   			$scope.riepilogo.frase = "Per premiare i tuoi clienti fedeli e attirarne di nuovi &egrave; importante pubblicare un\'offerta shock a cadenza mensile, anche per pochi giorni o per un numero ristretto di utenti. Hai attivo il modulo &ldquo;coupon&rdquo;, sarebbe un vero peccato non sfruttarlo, crea subito un coupon o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma non hai sfruttato al meglio le potenzialit&agrave; del coupon. Ricorda che a tutti piace fare dei buoni affari... crea dei coupon allettanti ed aumenta il passa parola. Crea subito un deal o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai sfruttando al meglio lo strumento dei coupon. Continua cos&igrave; e ricorda che i clienti amano fare dei buon affari diventando cos&igrave; degli ottimi sponsor.";
			}

			$scope.riepilogo.titolo= "Coupon";
			$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " coupon su " + $scope.riepilogo.soglie;
			$scope.riepilogo.icon = "fa-gavel";
		break;
		case "risposte_commenti":
			if ($scope.riepilogo.esito < 40){
				$scope.riepilogo.frase = "Dare importanza ai clienti che hanno contribuito alla tua reputazione &egrave; molto importante, anche quando hai ricevuto una critica, in questo periodo non hai prestato attenzione ai tuoi clienti, gratificali rispondendo alle loro recensioni o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ti bastano pochi instanti per rispondere alle recensioni, non fermarti! Ricorda che la tua reputazione e l\'attenzione che dedichi alle recensioni influenzeranno i tuoi affari. Vai subito alla sezione recensioni e rispondi oppure contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai sfruttando al meglio le recensioni che hai ricevuto, gratificando i tuoi clienti ed aumentando la tua web reputation.";
			}

			$scope.riepilogo.titolo= "Commenti";
			if ($scope.riepilogo.dati == 1){
				$scope.riepilogo.testo_esito = "Hai risposto a " + $scope.riepilogo.dati + " commento su " + $scope.riepilogo.soglie;
			}else {
				$scope.riepilogo.testo_esito = "Hai risposto a " + $scope.riepilogo.dati + " commenti su " + $scope.riepilogo.soglie;
			}

			$scope.riepilogo.icon = "fa-commenting-o";
		break;
		case "messaggi_email":
			if ($scope.riepilogo.esito < 40){
				$scope.riepilogo.frase = "&ldquo;Comunicare&rdquo; con i propri clienti &egrave; tra le cose pi&ugrave; importanti e redditizie che puoi fare; in questo periodo non hai dato il giusto peso a questa attivit&agrave;, crea subito la tua campagna email o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma potresti fare meglio! Ricorda che comunicare con la tua clientela &egrave; un\'attivit&agrave; fondamentale!!! Prepara subito una campagna email, &ldquo;&Egrave; GRATUITA&rdquo;! Non lasciare campo libero ai tuoi concorrenti, contatta subito il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai comunicando al meglio con i tuoi clienti. Continua cos&igrave; e ricorda che i clienti desiderano essere informati e sentirsi importanti.";
			}

			$scope.riepilogo.titolo= "Campagna email";
			$scope.riepilogo.testo_esito = "Hai inviato " + $scope.riepilogo.dati + " email su " + $scope.riepilogo.soglie;
			$scope.riepilogo.icon = "fa-at";
		break;
		case "messaggi_sms":
			if ($scope.riepilogo.esito < 40){
				$scope.riepilogo.frase = "&ldquo;Restare in contatto&rdquo; con i propri clienti &egrave; tra le cose pi&ugrave; importanti e redditizie che puoi fare; in questo periodo non hai sfruttato questa possibilit&agrave;, crea subito la tua campagna sms o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma potresti fare meglio, &egrave; un peccato! Ricorda che se non comunichi con la tua clientela potrebbe farlo qualcun altro al posto tuo!!! Quindi prepara subito una campagna sms o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai sfruttando al meglio l&apos;sms marketing. Continua cos&igrave; e ricorda che i clienti desiderano essere informati e sentirsi importanti.";
			}

			$scope.riepilogo.titolo= "Campagna sms";
			$scope.riepilogo.testo_esito = "Hai inviato " + $scope.riepilogo.dati + " sms su " + $scope.riepilogo.soglie;
			$scope.riepilogo.icon = "fa-mobile";
		break;
		case "facebook":
			if ($scope.riepilogo.esito < 40){
				$scope.riepilogo.frase = "Avere una pagina facebook povera di contenuti non produce benefici! Condividere i contenuti che crei su Facebook significa esporre la propria attivit&agrave; nel centro  commerciale pi&ugrave; grande del momdo! Crea subito una news o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma dovresti aumentare la frequenza con la quale aggiorni la tua fan page, ogni post pu&ograve; essere condiviso dai tuoi &ldquo;fan&rdquo; dando il via a una catena di condivisioni potenzialmente virale. Crea subito una notizia o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai curando al meglio la tua pagina Facebook! Continua cos&igrave; e ricorda che la qualit&agrave; della tua comunicazione influenza i tuoi affari.";
			}

			$scope.riepilogo.titolo= "Facebook";
			$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " post su " + $scope.riepilogo.soglie;
			$scope.riepilogo.icon = "fa-facebook-official";
		break;
		case "twitter":
			if ($scope.riepilogo.esito < 40){
				$scope.riepilogo.frase = "Twitter &egrave; il secondo social network pi&ugrave; utilizzato in Italia, &egrave; un canale importante dove comunicare, &egrave; comunque un &ldquo;luogo&rdquo; dove poter ingaggiare e fidelizzare clienti. Crea subito una news o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 40 && $scope.riepilogo.esito < 70){
				$scope.riepilogo.frase = "Sei sulla giusta strada, ma non stai sfruttando a sufficenza Twitter! Crea subito il tuo prossimo Tweet o contatta il tuo tutor per chiedere aiuto e supporto.";
			}else if ($scope.riepilogo.esito >= 70){
				$scope.riepilogo.frase = "Congratulazioni, stai curando al meglio le tue relazioni su Twitter! Continua cos&igrave; e ricorda che la qualit&agrave; della tua comunicazione influenza i tuoi affari.";
			}

			$scope.riepilogo.titolo= "Twitter";
			$scope.riepilogo.testo_esito = "Hai pubblicato " + $scope.riepilogo.dati + " tweet su " + $scope.riepilogo.soglie;
			$scope.riepilogo.icon = "fa-twitter";
		break;
		default:

		break;
	}

});