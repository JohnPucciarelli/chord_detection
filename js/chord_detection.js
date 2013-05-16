var ChordDetect = ( function(options) {

	var _cd = {};

	var _context;
	var _microphone;
	var _volume;

	var _defaults = {
		volume: 0.3
	};

	var _attrs = _.defaults(options, _defaults);

	var _error = function(message) {
		console.log("Error: " + message);
	};

	_cd.listen = function() {

		if (typeof AudioContext !== 'undefined') {
			_context = new AudioContext();
		} else if (typeof webkitAudioContext !== 'undefined') {
			_context = new webkitAudioContext();
		} else {
			_error('Audio context not supported!');	
		}
	
		if (_context) {

			var gainNode = _context.createGainNode();
			_volume = gainNode.gain;
			_volume.value = _defaults.volume;

			navigator.webkitGetUserMedia( { audio: true }, function(stream) {

				_microphone = _context.createMediaStreamSource(stream);
				_microphone.connect(gainNode);

				gainNode.connect(_context.destination);

			 },  _error('failed to get user media.') );
			
		}

	};

	// set volume 0.0 - 1.0
	_cd.setVolume = function(vol) {

		if (vol > 1.0) vol = 1.0;
		if (vol < 0.0) vol = 0.0;
		_volume.value = vol;
		console.log("changed volume: " + _volume.value);

	};

	_cd.volumeUp = function() {

		_cd.setVolume(_volume.value + 0.1);

	};

	_cd.volumeDown = function() {

		_cd.setVolume(_volume.value - 0.1);

	};

	return _cd;

}({}) );
