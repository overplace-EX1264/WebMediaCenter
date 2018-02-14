angular.module('help.services', [])

.factory('Help', function(Auth){

	var _this = this;

	var wmc_data = Auth.getUserData('wmc_data');

	_this.listModuli = [
		/*{ id:'notifiche', name:'Notifiche', link:'#/app/help/notifiche', icon:'fa-bell', order:1, active:true },
		{ id:'convalide', name:'Convalide', link:'#/app/help/convalide', icon:'fa-check-circle', order:2, active:true },*/
		{
			id: 'chat',
			name:'Chat',
			link:'#/app/help/chat',
			icon:'fa-comments',
			color: '#F1B708',
			order: 1,
			active: wmc_data.chat,
			shortDescription: 'La Chat di Overplace permette ai visitatori del tuo sito web e della tua vetrina di entrare in contatto diretto con te.',
			longDescription: "Grazie alla presenza della Chat, i visitatori della tua vetrina o del tuo sito, potranno entrare in contatto diretto con te in maniera rapida e veloce. " +
							"Grazie a questa App, gestire la tua Chat &egrave; comodo e semplice, riceverai una notifica in tempo reale ogni volta che un visitatore inizia una conversazione e potrai rispondere direttamente " +
							 "e rapidamente, proprio come se stessi partecipando a una conversazione su Whatsapp, il tutto a prescindere dal canale utilizzato dagli utenti; ad esempio potrai conversare contemporaneamente " +
							 "con un utente che visita il tuo sito, con un visitatore della tua vetrina e con un utilizzatore del tuo sito mobile. Potrai utilizzare la Chat anche da pc o da tablet, semplicemende " +
							 "lasciando aperto il browser nell'area riservata del tuo Web Media Center, mentre continui il tuo lavoro riceverai i messaggi direttamente sul dekstop. " +
							 "Le statistiche confermano che la presenza di questo utile strumento, fruibile anche dai visitatori che utilizzano dispositivi mobile, incrementa esponenzialmente l'ingaggio del potenziale cliente.",
			detail: {
				vantage: [
					'Incremento degli affari',
					'Semplice da usare',
					'Comunicazione pi&ugrave; veloce ed immediata, coinvolgimento dell&apos;utente finale',
					'Maggiore tranquillit&agrave; in fase di acquisto o prenotazione da parte del consumatore'
				],
				features: [
					'Chat illimitate',
					'Funziona anche da mobile',
					'Stessa chat per tutti i punti di contatto, canali',
					'L\'esercente potr&agrave; rispondere dal Web Media Center o direttamente dallo Smartphone utilizzando l\'App iOS / Android dedicata all\'esercente'
				],
				extra: []
			}
		},
		{
			id: 'news',
			name:'News',
			link:'#/app/help/news',
			icon:'fa-quote-left',
			color: '#A0825A',
			order: 2,
			active: true,
			shortDescription: 'Con le News hai la possibilit&agrave; di aggiornare il contenuto del tuo sito e della tua vetrina in pochi semplici step, fornendo informazini utili inerenti la tua attivit&agrave;',
			longDescription: 'Pubblica notizie, fornisci informazioni e aggiornamenti, coinvolgi i tuoi potenziali clienti con curiosità e notizie inerenti il tuo lavoro. '+
					'Grazie a questa app potrai pubblicare contenuti nella tua vetrina, nel tuo sito o nella tua app, in pochi e semplici passaggi. '+
					'Sfrutta la fotocamera del tuo smartphone per arricchire i tuoi contenuti con immagini accattivanti, invia la notizia via email o sms alle tue liste contatti, propaga e rendi virali i tuoi contenuti diffondendoli direttamente su Facebook e Twitter. '+
					'Pochi gesti e potrai parlare di te e della tua attivit&agrave; ad una platea vastissima di potenziali clienti.',
					
			detail: {
				vantage: [
					'Possibilit&agrave; di aggiornare pi&ugrave; piattaforme contemporaneamente',
					'Semplice da usare',
					'Possibilit&agrave; di arricchire le notizie con foto scattate al momento o presenti in galleria',
					'Aumento dell&apos;engagement dei tuoi strumenti di visibilit&agrave;'
				],
				features: [
					'News illimitate',
					'Possibilit&agrave; di pubblicazione programmata / differita delle notizie',
					'Le sue funzionalit&agrave; si espandono in presenza dei moduli Social e Messaggi',
					'Possibilit&agrave; di modificare ed eliminare le News'
				],
				extra: [
					'In combinazione con il modulo Messaggi, le News possono essere utilizzate come contenuto per campagne di Email e Sms marketing',
					'In combinazione con il modulo Social, le News possono essere pubblicate anche nella Pagina Facebook associata alla vetrina Overplace e su Twitter'
				]
			}
		},
		{
			id: 'eventi',
			name: 'Eventi',
			link: '#/app/help/eventi',
			icon: 'fa-bullhorn',
			color: '#F77B0E',
			order: 3,
			active:true,
			shortDescription: 'Pubblicizza gli eventi e le iniziative della tua azienda, arricchisci la tua presenza online evidenziando ci&ograve; che fai e come lo fai.',
			longDescription: 'Grazie agli Eventi potrai rendere note le tue iniziative e le tue attivit&agrave;, coinvolgendo il tuo pubblico online e fornendo preziose informazioni sul tuo lavoro. '+
							'Potrai specificare le date e gli orari dei tuoi eventi, aggiungere immagini e informazioni sui contenuti e sui potenziali destinatari della tua iniziativa. '+
							'Avrai la possibilit&agrave; di creare e gestire gli Eventi direttamente da questa applicazione o dal Web Media Center. '+
							'In combinazione con il modulo messaggi potrai far si che il tuo evento divenga il contenuto di una campagna di sms o email marketing, destinata alle tue liste contatti o agli utenti che hanno interagito con te.',
							
			detail: {
				vantage: [
					'Aumento della visibilit&agrave;',
					'Engagement',
					'Possibilit&agrave; di arricchire gli eventi con foto scattate al momento o presenti in galleria',
					'Possibilit&agrave; di aggiornare pi&ugrave; piattaforme contemporaneamente',
				],
				features: [
					'Eventi illimitati',
					'Le funzionalit&agrave; si espandono in presenza del modulo Messaggi',
					'Possibilit&agrave; di modificare ed eliminare gli eventi creati'
				],
				extra: [
				    'In combinazione con il modulo Messaggi, gli Eventi organizzati possono essere utilizzati come contenuto per campagne di Email e Sms marketing',
				    'In combinazione con il modulo Social, le News possono essere pubblicate anche al profilo Twitter associato al Web Media Center'
				]
			}
		},
		{
			id: 'promozioni',
			name: 'Promozioni',
			link: '#/app/help/promozioni',
			icon: 'fa-trophy',
			color: '#CD0A32',
			order: 4,
			active: wmc_data.promozioni,
			shortDescription: 'Offri sconti e offerte fedelt&agrave; per attrarre e fidelizzare i tuoi clienti.',
			longDescription: 'Grazie al modulo Promozioni, Overplace ti offre la possibilit&agrave; di mettere a disposizione dei tuoi clienti e visitatori sconti incrementali e offerte fidelizzanti. '+
							'Potrai configurare il modulo direttamente dal Web Media Center, configurando fino a tre livelli di scontistica, accessibili al cliente solo dopo essersi aggiudicato un numero minimo (da te configurato) di offerte "base". '+
							'L&apos;offerta base &egrave; il cuore del modulo e pu&ograve; essere configurata in qualsiasi momento direttamente da questa applicazione, si tratta della promozione di primo livello, accessibile a tutti, il tuo punto di partenza per accogliere nuovi potenziali clienti. '+
							'In combinazione al modulo Messaggi e Social, l&apos;App WebMediaCenter ti da la possibilit&agrave; di pubblicizzare la tua Offerta promozionale anche sui Social network Facebook e Twitter e di utilizzarla come oggetto per nuove campagne di email e sms marketing. '+
							'Ogni volta che un cliente richieder&agrave; una promozione, riceverai una notifica e avrai la possibilit&agrave; di convalidare l&apos;avvenuta erogazione dello sconto direttamente dal tuo smartphone.',
			detail: {
				vantage: [
					'Attrai nuovi clienti con degli sconti pubblicizzati sul web',
					'Fidelizza chi ha gi&agrave; usufruito delle tue promozioni',
					'Diffondi le tue offerte sul web',
					'Possibilit&agrave; per gli utenti di usufruire delle promozioni inviando un Sms'
				],
				features: [
					'Offerta standard modificabile in qualsiasi momento',
					'Convalida degli sconti direttamente dall&apos;App',
					'Incremento della banca dati Overplace',
					'Modulo da installare nella fan page Facebook della propria attivit&agrave;'
				],
				extra: [
					'In combinazione con il modulo Messaggi, la Promozione pu&ograve; essere utilizzata come contenuto per campagne di Email e Sms marketing',
					'In combinazione con il modulo Social, la Promozione pu&ograve; essere pubblicizzata su Twitter e Facebook e, inoltre, rende disponibile l&apos;App Facebook "Overplace Promozioni", da installare nella propria Fan Page direttamente dal Web Media Center'
				]
			}
        },
		{
			id: 'coupon',
			name: 'Coupon',
			link: '#/app/help/coupon',
			icon: 'fa-gavel',
			color: '#96C85A',
			order: 5,
			active: wmc_data.coupon,
			shortDescription: 'Crea le tue offerte shock e fatti conoscere attraverso vantaggiosissimi Coupon.',
			longDescription: 'Attraverso il modulo Coupon potrai creare strepitosi Deal da proporre ai visitatori delle tue piattaforme online. La formula Coupon Overplace &egrave; unica, a differenza delle altre piattaforme online, infatti, non prevede il pagamento anticipato da parte dell&apos;utente. '+
							'Una persona prenota il coupon e, in pochi secondi riceve il voucher da presentarti a titolo di conferma, tutto il resto avviene in loco. '+
							'Attraverso l&apos;App WebMediaCenter potrai creare velocemente le tue offerte Coupon, controllarne lo stato di validazione e ricevere una notifica ogni volta che un utente richiede il tuo Deal. '+
							'In combinazione al modulo Messaggi e Social, l&apos;App WebMediaCenter ti da la possibilit&agrave; di pubblicizzare il tuo Coupon anche sui Social network Facebook e Twitter e di utilizzarla come oggetto per nuove campagne di email e sms marketing. ',
			detail: {
				vantage: [
					'Incremento della customer base',
					'Formula coupon vantaggiosa per l&apos;esercente',
					'Possibilit&agrave; di pubblicare coupon illimitati',
					'Pagamento in loco'
				],
				features: [
					'Controllo sui contenuti e validazione del coupon da parte di personale qualificato',
					'Pubblicazione del Coupon su tutte le piattaforme associate',
					'Modulo da installare nella fan page Facebook della propria attivit&agrave;',
					'Gestione semplificata attraverso l&apos;App'
				],
				extra: [
					'In combinazione con il modulo Messaggi, il Deal pu&ograve; essere utilizzato come contenuto per campagne di Email e Sms marketing',
					'In combinazione con il modulo Social, il Coupon pu&ograve; essere pubblicizzato su Twitter e Facebook e, inoltre, rende disponibile l&apos;App Facebook "Overplace Coupon", da installare nella propria Fan Page direttamente dal Web Media Center'
				]
			}
		},
		{
			id: 'recensioni',
			name: 'Recensioni',
			link: '#/app/help/recensioni',
			icon: 'fa-commenting-o',
			color: '#55afe6',
			order: 6,
			active: true,
			shortDescription: 'Visualizza le recensioni ricevute e inserisci le tue risposte.',
			longDescription: 'Consulta le recensioni ricevute dal tuo sito e dalla tua Vetrina Virtuale, rispondi ai commenti degli utenti e aumenta l&apos;engagement prodotto dalle tue piattaforme online. '+
							'L&apos;App WebMediaCenter ti invier&agrave; una notifica ogni qual volta la tua attivit&agrave; ricever&agrave; una recensione, dandoti la possibilit&agrave; di inserire una risposta o un ringraziamento con pochi semplici gesti. '+
							'Sia le recensioni ricevute che le tue risposte saranno sottoposte a controllo da parte del personale Overplace, per garantirne la correttezza sia dei contenuti che della forma.',
			detail: {
				vantage: [
					'Aggiornamenti in tempo reale sulle nuove recensioni ricevute',
					'Monitoraggio continuo dell&apos;apprezzamento espresso dalla clientela'
				],
				features: [
					'Controllo sui contenuti e validazione delle recensioni da parte di personale qualificato',
					'Rispondi alle recensioni direttamente dal tuo smartphone'
				],
				extra: [
					'Le recensioni ricevute, in presenza del modulo Social, vengono condivise anche sulla Pagina Facebook associata alla Vetrina Virtuale dal Web Media Center',
					'In presenza del modulo Social, dal Web Media Center &egrave; possibile importare le recensioni inserite dagli utente nella fan page della tua attivit&agrave;'
				]
			}
		},
		{
			id: 'gallery',
			name: 'Gallery',
			link: '#/app/help/gallery',
			icon: 'fa-picture-o',
			color: '#9bcdcd',
			order: 7,
			active: true,
			shortDescription: 'Carica foto dal tuo smartphone alle gallerie del Web Media Center.',
			longDescription: 'Grazie all&apos;app WebMediaCenter potrai scattare una foto o scegliere un&apos;immagine dalla tua galleria e condividerla con il Web Media Center in pochi istanti. '+
							'In fase di caricamento potrai scegliere per quali moduli rendere disponibili le foto che andrai a caricare. Ad esempio potrai fotografare le tue creazioni culinarie da utilizzare nel modulo Menu o fotografare i tuoi prodotti artigianali da pubblicare attraverso il modulo Catalogo. '+
							'Una volta terminata l&apos;operazione potrai utilizzare le foto che hai caricato dal tuo smartphone direttamente all&apos;interno dall&apos;interfaccia web del Web Media Center.',
			detail: {
				vantage: [
			          'Carica le foto direttamente dal tuo smartphone nel Web Media Center',
			          'Possibilit&agrave; di arricchire le gallerie immagini dei diversi moduli in maniera veloce e intuitiva'
			   ],
			   features: [
			          'Resize e ottimizzazione delle immagini automatico',
				      'Condivisione dei media su tutte le piattaforme online (Sito, Vetrina, Sito mobile...)'
			   ],
			   extra: [
			       'In presenza del modulo Social, le foto vengono condivise anche sulla Pagina Facebook associata alla Vetrina'
			   ]
			}
		}
	];

	return {

		starter: function(){
			return _this.listModuli;
		},

		getModulo: function(id){
			var len = _this.listModuli.length;
			for (elem = 0; elem < len; elem++){
				if (_this.listModuli[elem].id == id)
					return _this.listModuli[elem];
			}

		}
	};
})