var ChordDetect = function(options) {

	var _cd = {};

	var _context;
	var _analyser;
	var _microphone;
	var _volume;

	var _defaults = {
		volume: 0.0,
		fftSize: 1024,
		smoothing: 0
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

			_analyser = _context.createAnalyser();
			_analyser.smoothingTimeConstant = _attrs.smoothing;
			_analyser.fftSize = _attrs.fftSize;
			
			var gainNode = _context.createGainNode();
			_volume = gainNode.gain;
			_cd.setVolume(_attrs.volume);

			navigator.webkitGetUserMedia( { audio: true }, function(stream) {

				_microphone = _context.createMediaStreamSource(stream);
				_microphone.connect(_analyser);

				_analyser.connect(gainNode);
				gainNode.connect(_context.destination);

				_cd.animate();

			 },  _error('failed to get user media.') );
			
		}

	};

	_cd.animate = function() {

		var canvas = document.getElementById('canvas');

		if (canvas.getContext) {

			var context = canvas.getContext('2d');
						
			var requestAnimationFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				function(callback) {
					return setTimeout(callback, 1);
			};

			var draw = function() {

				context.fillStyle = 'rgba(255, 255, 255, 0.01)';
				context.beginPath();
				context.rect(0, 0, canvas.width, canvas.height);
				context.fill();
				//context.clearRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = 'rgb(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ')';

				var blockWidth = canvas.width / (_attrs.fftSize / 2);
				var blockHeight = canvas.height / 256;

				var frequencyArray = new Uint8Array(_analyser.frequencyBinCount);
				_analyser.getByteFrequencyData(frequencyArray);

				for (var i = 0; i < frequencyArray.length; i++) {
					context.beginPath();
					context.rect(i * blockWidth, canvas.height, blockWidth, -1 * frequencyArray[i] * blockHeight); 
					context.fill();
				}

			requestAnimationFrame(draw);

			};

			draw();

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

	_cd.getVolume = function() {
		return _volume.value;
	};

	return _cd;

};
