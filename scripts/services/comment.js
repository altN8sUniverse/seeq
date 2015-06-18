'use strict';

app.factory('Comment', function(FURL, $firebase) {

	var ref = new Firebase(FURL);	

	var Comment = {
		comments: function(jobId) {
			return $firebase(ref.child('comments').child(jobId)).$asArray();
		},

		addComment: function(jobId, comment) {
			var job_comments = this.comments(jobId);
			comment.datetime = Firebase.ServerValue.TIMESTAMP;

			if(job_comments) {
				return job_comments.$add(comment);	
			}			
		}
	};

	return Comment;
});