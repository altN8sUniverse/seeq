'use strict';

app.controller('BrowseController', function($scope, $routeParams, toaster, job, Auth, Comment, Offer) {

	$scope.searchjob = '';		
	$scope.jobs = job.all;

	$scope.user = Auth.user;
	$scope.signedIn = Auth.signedIn;

	$scope.listMode = true;
	
	if($routeParams.jobId) {
		var job = job.getjob($routeParams.jobId).$asObject();
		$scope.listMode = false;
		setSelectedjob(job);	
	}	
		
	function setSelectedjob(job) {
		$scope.selectedjob = job;
		
		// We check isjobCreator only if user signedIn 
		// so we don't have to check every time normal guests open the job
		if($scope.signedIn()) {
			
			// Check if the current login user has already made an offer for selected job
			Offer.isOfferred(job.$id).then(function(data) {
				$scope.alreadyOffered = data;
			});

			// Check if the current login user is the creator of selected job
			$scope.isjobCreator = job.isCreator;

			// Check if the selectedjob is open
			$scope.isOpen = job.isOpen;

			// Unblock the Offer button on Offer modal
			// $scope.offer = {close: ''};	
			$scope.block = false;

			// Check if the current login user is offer maker (to display Cancel Offer button)
			$scope.isOfferMaker = Offer.isMaker;

			// --------------------------------------------//

			// Check if the current user is assigned fot the selected job
			$scope.isAssignee = job.isAssignee;

			// Check if the selectedjob is completed
			$scope.isCompleted = job.isCompleted;

		}
		
		// Get list of comments for the selected job
		$scope.comments = Comment.comments(job.$id);

		// Get list of offers for the selected job
		$scope.offers = Offer.offers(job.$id);		
	};

	// --------------- job ---------------	

	$scope.canceljob = function(jobId) {
		job.canceljob(jobId).then(function() {
			toaster.pop('success', "This job is cancelled successfully.");
		});
	};

	// --------------------------------------------//

	$scope.completejob = function(jobId) {
		job.completejob(jobId).then(function() {
			toaster.pop('success', "Congratulation! You have completed this job.");
		});
	};

	// --------------- COMMENT ---------------	

	$scope.addComment = function() {
		var comment = {
			content: $scope.content,
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar
		};

		Comment.addComment($scope.selectedjob.$id, comment).then(function() {				
			$scope.content = '';		
		});		
	};

	// --------------- OFFER ---------------

	$scope.makeOffer = function() {
		var offer = {
			total: $scope.total,
			uid: $scope.user.uid,			
			name: $scope.user.profile.name,
			gravatar: $scope.user.profile.gravatar 
		};

		Offer.makeOffer($scope.selectedjob.$id, offer).then(function() {
			toaster.pop('success', "Your offer has been placed.");
			
			// Mark that the current user has offerred for this job.
			$scope.alreadyOffered = true;
			
			// Reset offer form
			$scope.total = '';

			// Disable the "Offer Now" button on the modal
			$scope.block = true;			
		});		
	};

	$scope.cancelOffer = function(offerId) {
		Offer.cancelOffer($scope.selectedjob.$id, offerId).then(function() {
			toaster.pop('success', "Your offer has been cancelled.");

			// Mark that the current user has cancelled offer for this job.
			$scope.alreadyOffered = false;

			// Unblock the Offer button on Offer modal
			$scope.block = false;			
		});
	};

	// --------------------------------------------//

	$scope.acceptOffer = function(offerId, runnerId) {
		Offer.acceptOffer($scope.selectedjob.$id, offerId, runnerId).then(function() {
			toaster.pop('success', "Offer is accepted successfully!");

			// Mark that this job has been assigned
			// $scope.isAssigned = true;

			// Notify assignee
			Offer.notifyRunner($scope.selectedjob.$id, runnerId);
		});
	};


	
});