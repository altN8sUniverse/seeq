'use strict';

app.factory('Dashboard', function(FURL, $firebase, $q) {
	var ref = new Firebase(FURL);

	var Dashboard = {
		
		getjobsForUser: function(uid) {
			var defer = $q.defer();

			$firebase(ref.child('user_jobs').child(uid))
				.$asArray()
				.$loaded()
				.then(function(jobs) {					
					defer.resolve(jobs);
				}, function(err) {
					defer.reject();
				});

			return defer.promise;
		}
	};

	return Dashboard;
});