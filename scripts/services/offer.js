'use strict';

app.factory('Offer', function(FURL, $firebase, $q, Auth, job) {
	var ref = new Firebase(FURL);
	var user = Auth.user;

	var Offer = {
		offers: function(jobId) {
			return $firebase(ref.child('offers').child(jobId)).$asArray();
		},

		makeOffer: function(jobId, offer) {
			var job_offers = this.offers(jobId);

			if(job_offers) {
				return job_offers.$add(offer);
			}
		},

		// This function is to check if the login user already made offer for this job.
		// This to prevent a user from offering more than 1.
		isOfferred: function(jobId) {

			if(user && user.provider) {
				var d = $q.defer();

				$firebase(ref.child('offers').child(jobId).orderByChild("uid")
					.equalTo(user.uid))
					.$asArray()
					.$loaded().then(function(data) {						
						d.resolve(data.length > 0);
					}, function() {
						d.reject(false);
					});

				return d.promise;
			}
			
		},

		isMaker: function(offer) {
			return (user && user.provider && user.uid === offer.uid);
		},

		getOffer: function(jobId, offerId) {
			return $firebase(ref.child('offers').child(jobId).child(offerId));
		},

		cancelOffer: function(jobId, offerId) {
			return this.getOffer(jobId, offerId).$remove();			
		},

		//-----------------------------------------------//

		acceptOffer: function(jobId, offerId, runnerId) {
			// Step 1: Update Offer with accepted = true
			var o = this.getOffer(jobId, offerId);
			return o.$update({accepted: true})
				.then(function() {				
						
					// Step 2: Update job with status = "assigned" and runnerId
					var t = job.getjob(jobId);			
					return t.$update({status: "assigned", runner: runnerId});	
				})
				.then(function() {					

					// Step 3: Create User-jobs lookup record for use in Dashboard
					return job.createUserjobs(jobId);
				});
		},

		notifyRunner: function(jobId, runnerId) {
			// Get runner's profile
			Auth.getProfile(runnerId).$loaded().then(function(runner) {
				var n = {
					jobId: jobId,
					email: runner.email,
					name: runner.name
				};

				// Create Notification and Zapier will delete it after use.
				var notification = $firebase(ref.child('notifications')).$asArray();
				return notification.$add(n);	
			});
		}

	};

	return Offer;

})