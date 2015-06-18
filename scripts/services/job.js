'use strict';

app.factory('job', function(FURL, $firebase, Auth) {
	var ref = new Firebase(FURL);
	var jobs = $firebase(ref.child('jobs')).$asArray();
	var user = Auth.user;

	var job = {
		all: jobs,

		getjob: function(jobId) {
			return $firebase(ref.child('jobs').child(jobId));
		},

		createjob: function(job) {
			job.datetime = Firebase.ServerValue.TIMESTAMP;
			return jobs.$add(job).then(function(newjob) {
				
				// Create User-jobs lookup record for POSTER
				var obj = {
					jobId: newjob.key(),
					type: true,
					title: job.title
				};

				return $firebase(ref.child('user_jobs').child(job.poster)).$push(obj);
			});
		},

		createUserjobs: function(jobId) {
			job.getjob(jobId)
				.$asObject()
				.$loaded()
				.then(function(job) {
					
					// Create User-jobs lookup record for RUNNER
					var obj = {
						jobId: jobId,
						type: false,
						title: job.title
					}

					return $firebase(ref.child('user_jobs').child(job.runner)).$push(obj);	
				});	
		},

		editjob: function(job) {
			var t = this.getjob(job.$id);			
			return t.$update({title: job.title, description: job.description, total: job.total});
		},

		canceljob: function(jobId) {
			var t = this.getjob(jobId);
			return t.$update({status: "cancelled"});
		},

		isCreator: function(job) {			
			return (user && user.provider && user.uid === job.poster);
		},

		isOpen: function(job) {
			return job.status === "open";
		},

		// --------------------------------------------------//

		isAssignee: function(job) {
			return (user && user.provider && user.uid === job.runner);	
		},

		completejob: function(jobId) {
			var t = this.getjob(jobId);
			return t.$update({status: "completed"});
		},

		isCompleted: function(job) {
			return job.status === "completed";
		}
	};

	return job;

});