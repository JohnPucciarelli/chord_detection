var ChordDetect = function(options) {

	var _cd = {};

	var _audio;
	var _analyser;
	var _microphone;
	var _volume;
	var _canvas;
	var _canvasContext;

	var _startAnimation;
	var _animateSpectrum;
	var _animateSpectrogram

	var _defaults = {
		volume: 0.0,
		fftSize: 1024,
		smoothing: 0,
		mode: 'spectrum',
		canvasId: 'canvas'
	};

	var _attrs = _.defaults(options, _defaults);

	var _error = function(message) {
		console.log("Error: " + message);
	};

	_cd.listen = function() {

		if (typeof AudioContext !== 'undefined') {
			_audio = new AudioContext();
		} else if (typeof webkitAudioContext !== 'undefined') {
			_audio = new webkitAudioContext();
		} else {
			_error('Audio context not supported!');	
		}
	
		if (_audio) {

			_analyser = _audio.createAnalyser();
			_analyser.smoothingTimeConstant = _attrs.smoothing;
			_analyser.fftSize = _attrs.fftSize;
			
			var gainNode = _audio.createGainNode();
			_volume = gainNode.gain;
			_cd.setVolume(_attrs.volume);

			navigator.webkitGetUserMedia( { audio: true }, function(stream) {

				_microphone = _audio.createMediaStreamSource(stream);
				_microphone.connect(_analyser);

				_analyser.connect(gainNode);
				gainNode.connect(_audio.destination);

				_startAnimation(_attrs.mode);

			 },  _error('failed to get user media.') );
			
		}

	};

	var _startAnimation = function(mode) {

		_canvas = document.getElementById(_attrs.canvasId);

		if (_canvas.getContext) { 

			_canvasContext = _canvas.getContext('2d');
			_requestAnimationFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				function(callback) {
					return setTimeout(callback, 1);
				};


			switch (mode) {

				case 'spectrum':
					_animateSpectrum();
				break;

				case 'spectrogram':
				default:
					_animateSpectrogram();
				break;
			}

		} else {

			_error('Failed to find canvas with id: ' + _attrs.canvasId);

		}

	};

	_animateSpectrum = function() {

			var draw = function() {

				_canvasContext.fillStyle = 'rgba(255, 255, 255, .01)';
				_canvasContext.beginPath();
				_canvasContext.rect(0, 0, canvas.width, canvas.height);
				_canvasContext.fill();
				_canvasContext.fillStyle = 'rgb(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ')';

				var blockWidth = canvas.width / (_attrs.fftSize / 2);
				var blockHeight = canvas.height / 256;

				var frequencyArray = new Uint8Array(_analyser.frequencyBinCount);
				_analyser.getByteFrequencyData(frequencyArray);

				for (var i = 0; i < frequencyArray.length; i++) {
					_canvasContext.beginPath();
					_canvasContext.rect(i * blockWidth, canvas.height, blockWidth, -1 * frequencyArray[i] * blockHeight); 
					_canvasContext.fill();
				}

				_requestAnimationFrame(draw);

			};

			draw();

	};

	_animateSpectrogram = function() {

		var tempCanvas = document.createElement('canvas');
		var tempContext = tempCanvas.getContext('2d');

		var colorScale = chroma.scales.hot().domain([0, 255]); 

		var blockWidth = canvas.width / (_attrs.fftSize / 2);
		var blockHeight = canvas.height / 256;

		tempCanvas.width = _canvas.width;
		tempCanvas.height =  _canvas.height;

		var draw = function() {

			var frequencyArray = new Uint8Array(_analyser.frequencyBinCount);
			_analyser.getByteFrequencyData(frequencyArray);

			// copy current canvas to tempCanvas
			tempContext.drawImage(_canvas, 0, 0, canvas.width, canvas.height);
				
			for (var i = 0; i < frequencyArray.length; i++) {
				_canvasContext.fillStyle = colorScale(frequencyArray[i]).hex(); 
				_canvasContext.fillRect(canvas.width - blockWidth, canvas.height - i * blockHeight, blockWidth, blockHeight);
			}

			_canvasContext.translate(-1 * blockWidth, 0);
			_canvasContext.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, _canvas.width, _canvas.height);
			_canvasContext.setTransform(1, 0, 0, 1, 0, 0);

			_requestAnimationFrame(draw);

		};

		draw();

	}

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
