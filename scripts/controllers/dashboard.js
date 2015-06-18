'use strict';

app.controller('DashboardController', function($scope, Dashboard, Auth) {

	$scope.jobRunner = [];
	$scope.jobPoster = [];

	var uid = Auth.user.uid;

	Dashboard.getjobsForUser(uid).then(function(jobs) {

		for(var i = 0; i < jobs.length; i++) {
			jobs[i].type? $scope.jobPoster.push(jobs[i]) : $scope.jobRunner.push(jobs[i]) 
		}

		$scope.numPoster = $scope.jobPoster.length;
		$scope.numRunner = $scope.jobRunner.length;
	});
	
});