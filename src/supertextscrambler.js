/*
 * jQuery Super Text Scrambler
 * https://github.com/otto/jquery-supertextscrambler-plugin
 * MegazalRock (Otto Kamiya)
 *
 * Copyright (c) 2014 MegazalRock (Otto Kamiya)
 * Licensed under the MIT license.
 */
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


	var SuperTextScrambler = function(text, options){
		options = options || {};
		this.options = $.extend(true, {
			mode: 'en',
			wait: 1000,
			fps: 30,
			textFps: 30,
			autoWordBreak: true,
			saveSpace: true
		}, options);
		this.text = text;
		this.length = text.length;
		this.currentTextLength = 0;
		this.currentText = '';
		this.spaceIndexList = this.allIndexOf(this.text, ' ');
	};

	SuperTextScrambler.prototype.init = function($target){
		var sts = this;
		sts.$target = $target;
		sts.currentTextLength = 0;
		sts.currentText = '';

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

		$target
			.trigger('scramblerStart');
	};

	SuperTextScrambler.prototype.start = function(){
		var sts = this, $target = sts.$target, length = sts.length, mode = sts.options.mode;
		var delta, now, then = Date.now(), interval = 1000 / sts.options.fps;
		var textDelta, textThen = then, textInterval = 1000 / sts.options.textFps;
		var num = Math.floor(sts.options.textFps / 30) + (sts.options.textFps % 30 ? 1 : 0);
		
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
								.text(sts.stepText(num) + sts.getRndText(length - sts.currentTextLength, mode));
						}else{
							$target
								.text(sts.currentText + sts.getRndText(length - sts.currentTextLength, mode));
						}
						then = now - (delta % interval);
						textThen = now - (textDelta % textInterval);
					}
				}else{
					window.cancelAnimationFrame(sts.rafId);
					sts.end();
				}
			})();
		}, sts.options.wait);
	};

	SuperTextScrambler.prototype.stepText = function(num){
		var sts = this, i = 0;
		for(; i < num; i += 1){
			sts.currentText = sts.text.slice(0, sts.currentTextLength + 1);
			sts.currentTextLength = sts.currentText.length;
		}
		return sts.currentText;
	};

	SuperTextScrambler.prototype.getRndText = function(length, mode){
		var sts = this;
		var startCharCode, endCharCode , rndText = [], i = 0;
		mode = mode || 'en';

		if(mode === 'en'){
			startCharCode = 65;
			endCharCode = 122;
		}else{
			startCharCode = 0x4E00;
			endCharCode = 0x9FA0;
		}
		for(;i < length; i ++){
			if($.inArray(i, sts.spaceIndexList) === -1 || !sts.options.saveSpace){
				rndText.push(String.fromCharCode(startCharCode + Math.floor(Math.random() * (endCharCode - startCharCode))));
			}else{
				rndText.push(' ');
			}
		}

		return rndText.join('');

	};

	SuperTextScrambler.prototype.end = function(){
		var sts = this;
		if(sts.options.autoWordBreak){
			sts.$target
				.css(sts.defaultCss);
		}
		sts.$target
			.trigger('scramblerEnd');
	};

	SuperTextScrambler.prototype.allIndexOf = function(string, needle){
		var indices = [];
		for(var pos = string.indexOf(needle); pos !== -1; pos = string.indexOf(needle, pos + 1)) {
			indices.push(pos);
		}
		return indices;
	};

	$.extend({
		'SuperTextScrambler': function (text, options){
			return new SuperTextScrambler(text, options);
		}
	});
	$.fn.extend({
		'superTextScrambler':function (options){
			$(this)
				.each(function(){
					var $self = $(this);
					var text = $self.text();
					if(String(text).length){
						var sts = $self.data('SuperTextScrambler') || new SuperTextScrambler(text, options);
						sts.init($self);
						sts.start();
						$self.data('SuperTextScrambler', sts);
					}
				});
			return this;
		}
	});

}(this, jQuery));
