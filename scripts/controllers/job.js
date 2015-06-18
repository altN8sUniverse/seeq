'use strict';

app.controller('jobController', function($scope, $location, toaster, job, Auth) {

	$scope.createjob = function() {	
		$scope.job.status = 'open';
		$scope.job.gravatar = Auth.user.profile.gravatar;
		$scope.job.name = Auth.user.profile.name;
		$scope.job.poster = Auth.user.uid;

		job.createjob($scope.job).then(function(ref) {
			toaster.pop('success', 'job created successfully.');
			$scope.job = {title: '', description: '', total: '', status: 'open', gravatar: '', name: '', poster: ''};
			$location.path('/browse/' + ref.key());
		});
	};

	$scope.editjob = function(job) {
		job.editjob(job).then(function() {			
			toaster.pop('success', "job is updated.");
		});
	};
	
});