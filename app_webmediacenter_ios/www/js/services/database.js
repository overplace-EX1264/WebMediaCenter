angular.module('database.services', [])

.service('Database', function ($ionicPlatform, $q){
	
	var _method = {
		db: null,
		open: function (dbname, callback){
			$ionicPlatform.ready().then(function (){
				_method.db = window.sqlitePlugin.openDatabase({ 
					name: dbname, 
					location: 2, 
					androidDatabaseImplementation: 2, 
					androidLockWorkaround: 1 
				}, function (db){ 
					callback(db); 
				}, function (){ 
					
				});
				return _method;
			});
		},
		close: function (){ if (_method.db !== null){ _method.db.close(); } },
		delete: function (dbname){ 
			_method.close();
			window.sqlitePlugin.deleteDatabase({ name: dbname, location: 2 });
		}
	}
	
	
	return _method;
	
	
});