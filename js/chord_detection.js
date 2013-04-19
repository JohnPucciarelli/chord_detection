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

			_volume = _context.createGainNode();
			_volume.value = _defaults.volume;

			navigator.webkitGetUserMedia( { audio: true }, function(stream) {

				_microphone = _context.createMediaStreamSource(stream);
				_microphone.connect(_volume);

				_volume.connect(_context.destination);

			 },  _error('failed to get user media.') );
			
		}

	};

	_cd.setVolume = function(vol) {

		if (vol > 0.9) vol = 0.9;
		if (vol < 0.0) vol = 0.0;

	};

	_cd.volume_up = function() {

		_cd.setVolume(volume + 0.1);

	};

	_cd.volume_down = function() {

		_cd.setVolume(volume - 0.1);

	};

	return _cd;

}({}) );
