/*! jQuery Super Text Scrambler 2014-05-19
 *  Vertion : 1.0.1
 *  Dependencies : jQuery *
 *  Author : MegazalRock (Otto Kamiya)
 *  Copyright (c) 2014 MegazalRock (Otto Kamiya);
 *  License : */
(function(window, $, undefined) {

	(window.requestAnimationFrame =
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback) {
			return window.setTimeout(function() {
				callback(Date.now());
			}, 1000 / 60);
		}
	);

	(window.cancelAnimationFrame =
		window.cancelAnimationFrame ||
		window.webkitCancelAnimationFrame ||
		window.mozCancelAnimationFrame ||
		window.oCancelAnimationFrame ||
		window.msCancelAnimationFrame ||
		function(id){
			return clearTimeout(id);
		}
	);

	var defaultOptions = {
		mode: 'auto',
		wait: 1000,
		fps: 30,
		textFps: 30,
		autoWordBreak: true,
		saveSpace: true,
		returnPrimise: false,
		autoStart: false,
		addQueue: true
	};


	var SuperTextScrambler = function($target, text, options){
		var i;
		options = options || {};
		this.options = $.extend(true, {}, $.extend(true, defaultOptions, options));
		this.text = text;
		this.length = text.length;
		this.currentTextLength = 0;
		this.currentText = '';
		this.spaceIndexList = allIndexOf(this.text, ' ');
		this.charTable = {
			kanji: {
				startCharCode: 0x4e9c,
				endCharCode: 0x7199,
				length: 0x7199 - 0x4e9c
			},
			hiragana: {
				startCharCode: 0x3041,
				endCharCode: 0x3093,
				length: 0x3093 - 0x3041
			},
			katakana:{
				startCharCode: 0x30a1,
				endCharCode: 0x30f6,
				length: 0x30f6 - 0x30a1
			},
			ja: [],
			keisen: {
				startCharCode: 0x2500,
				endCharCode: 0x2542,
				length: 0x2542 - 0x2500
			},
			en: {
				startCharCode: 65,
				endCharCode: 122,
				length: 122 - 65
			}
		};
		this.charTable.ja = [
			this.charTable.kanji,
			this.charTable.hiragana,
			this.charTable.katakana
		];

		this.modeList = [
			'en',
			'ja',
			'keisen',
			'auto',
			'typewriter'
		];

		this.charTableJaLength = 0;

		for(i in this.charTable.ja){
			this.charTableJaLength += this.charTable.ja[i].length;
		}

		this.$target = $target;

		this.initialized = false;

		if(typeof options.mode !== 'undefined' && $.inArray(options.mode, this.modeList) === -1){
			throw 'mode is unexpected. auto, en, ja, keisen, typewriter';
		}
	};

	SuperTextScrambler.prototype.init = function(){
		var sts = this;
		var $target = sts.$target;
		sts.currentTextLength = 0;
		sts.currentText = '';

		if(sts.options.mode === 'auto'){
			if(/[ぁ-ん]/.test(sts.text) || /[ァ-ン]/.test(sts.text)){
				sts.options.mode = 'ja';
			}else{
				sts.options.mode = 'en';
			}
		}

		if(sts.options.autoWordBreak){
			sts.defaultCss = {
				wordWrap: $target.css('word-wrap'),
				wordBreak: $target.css('word-break')
			};
			$target
				.css({
					wordWrap: 'break-word',
					wordBreak: 'break-all'
				});
		}

		sts.initialized = true;
	};

	SuperTextScrambler.prototype.start = function(){
		var sts = this, $target = sts.$target, length = sts.length, mode = sts.options.mode;
		var delta, now, then = Date.now(), interval = 1000 / sts.options.fps;
		var textDelta, textThen = then, textInterval = 1000 / sts.options.textFps;
		var num = Math.floor(sts.options.textFps / 30) + (sts.options.textFps % 30 ? 1 : 0);

		$target
			.trigger('scramblerStart');

		sts.currentTextLength = 0;
		sts.currentText = '';
		sts.deferred = $.Deferred();
		
		setTimeout(function(){
			(function frame(){
				now = Date.now();
				sts.rafId = window.requestAnimationFrame(frame);
				delta = now - then;
				textDelta = now - textThen;
				if(sts.currentTextLength < length){
					if(delta >= interval){
						if(textDelta >= textInterval){
							$target
								.text(stepText(sts, num) + getRndText(sts, length - sts.currentTextLength, mode));
						}else{
							$target
								.text(sts.currentText + getRndText(sts, length - sts.currentTextLength, mode));
						}
						then = now - (delta % interval);
						textThen = now - (textDelta % textInterval);
					}
				}else{
					window.cancelAnimationFrame(sts.rafId);
					stsEnd(sts);
				}
			})();
		}, sts.options.wait);

		return sts.deferred.promise();
	};

	function stepText(sts, num){
		var i = 0;
		for(; i < num; i += 1){
			sts.currentText = sts.text.slice(0, sts.currentTextLength + 1);
			sts.currentTextLength = sts.currentText.length;
		}
		return sts.currentText;
	}

	function getRndText(sts, length, mode){
		var rndText = [];
		if(mode === 'typewriter'){
			if(length % 2){
				rndText = ['_'];
			}else{
				rndText = [' ', '|', ' '];
			}
			if(length < 2){
				rndText = rndText.splice(0, rndText.length - (2 - length));
			}
		}else{
			var startCharCode, endCharCode, i = 0, charTableIndex, isCharTableArray = $.isArray(sts.charTable[mode]);

			if(!isCharTableArray){
				startCharCode = sts.charTable[mode].startCharCode;
				endCharCode = sts.charTable[mode].endCharCode;
			}

			for(;i < length; i ++){
				if(isCharTableArray){
					charTableIndex = parseInt(Math.random() * sts.charTable[mode].length, 10);
					startCharCode = sts.charTable[mode][charTableIndex].startCharCode;
					endCharCode = sts.charTable[mode][charTableIndex].endCharCode;
				}

				if($.inArray(i, sts.spaceIndexList) === -1 || !sts.options.saveSpace){
					rndText.push(String.fromCharCode(startCharCode + parseInt(Math.random() * (endCharCode - startCharCode), 10)));
				}else{
					rndText.push(' ');
				}
			}
		}
		return rndText.join('');
	}

	function stsEnd(sts){
		if(sts.options.autoWordBreak){
			if(sts.defaultCss){
				sts.$target
					.css(sts.defaultCss);
			}
		}
		sts.deferred.resolve();
		sts.$target
			.trigger('scramblerEnd');
	}

	function allIndexOf(string, needle){
		var indices = [];
		for(var pos = string.indexOf(needle); pos !== -1; pos = string.indexOf(needle, pos + 1)) {
			indices.push(pos);
		}
		return indices;
	}

	$.extend({
		'SuperTextScrambler': function ($target, text, options){
			return new SuperTextScrambler($target, text, options);
		}
	});
	$.fn.extend({
		'superTextScrambler':function (options){
			options = $.extend(true, defaultOptions, options);
			var $targets = $(this);
			var length = $targets.length;
			var index = 0;
			var deferred;
			var texts = [];

			if(options.returnPrimise){
				deferred = $.Deferred();
			}

			$targets
				.each(function(n){
					texts[n] = $(this).text();
				});

			(function loop(){
				var $target = $targets.eq(index);
				var text = texts[index];
				var sts = $target.data('SuperTextScrambler') || new SuperTextScrambler($target, text, options);
				if(index !== 0){
					sts.options.wait = 0;
				}

				if(!sts.initialized){
					sts.init();
				}
				sts.start()
					.done(function(){
						if(index + 1 < length){
							index += 1;
							loop();
						}
					});
				$target.data('SuperTextScrambler', sts);
			})();

			if(options.returnPrimise){
				return deferred.promise();
			}else{
				return this;
			}
			return this;
		}
	});

}(this, jQuery));
