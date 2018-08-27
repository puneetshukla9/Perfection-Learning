
	
	// Simple error/retry handler for problem load failure
	
	function userLoadError(err)
	{
		PubSub.publish('commError:failed', {
			err: err,
			retry: loadStudents
		});
	}

	
	// Simple error/retry handler for problem load failure
	
	function studentLoadError(err)
	{
		PubSub.publish('commError:failed', {
			err: err,
			retry: loadStudents
		});
	}
