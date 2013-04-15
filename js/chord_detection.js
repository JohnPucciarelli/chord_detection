var ChordDetect = (function($) {

	var c_d = { };

	c_d.listen = function() {

		var context = new webkitAudioContext();

		navigator.webkitGetUserMedia({audio: true}, function(stream) {
			var microphone = context.createMediaStreamSource(stream);
		  var filter = context.createBiquadFilter();
				   microphone.connect(filter);
				     filter.connect(context.destination);
					 }, function() { alert('failed'); });
		
	};

	return c_d;

}(jQuery));
