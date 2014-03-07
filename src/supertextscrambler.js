/*
 * jQuery Super Text Scrambler
 * https://github.com/otto/jquery-supertextscrambler-plugin
 * MegazalRock (Otto Kamiya)
 *
 * Copyright (c) 2014 MegazalRock (Otto Kamiya)
 * Licensed under the MIT license.
 */
(function(window, $, undefined) {
	var SuperTextScrambler = function(text, options){
		options = options || {};
		this.options = $.extend(true, {
			mode: 'en',
			wait: 1000,
			interval: 60
		}, options);
		this.text = text;
		this.length = text.length;
		this.currentText = 0;
	};

	SuperTextScrambler.prototype.init = function($target){
		var sts = this;
		sts.$target = $target;
		$target
			.html('&nbsp;')
			.trigger('scramblerStart');
	};

	SuperTextScrambler.prototype.start = function(){
		var sts = this, interval = sts.options.interval;
		setTimeout(function(){
			(function loop(){
				if(sts.currentText < sts.length){
					sts.step();
					setTimeout(loop, interval);
				}else{
					sts.end();
				}
			})();
		}, sts.options.wait);
	};

	SuperTextScrambler.prototype.step = function(){
		var sts = this;
		sts.$target
			.text(sts.text.slice(0, sts.currentText + 1) + sts.getRndText(sts.length - sts.currentText - 1, sts.options.mode));

		sts.currentText += 1;
	};

	SuperTextScrambler.prototype.getRndText = function(length, mode){
		mode = mode || 'en';

		var startCharCode, endCharCode , rndText = [], i = 0;

		if(mode === 'en'){
			startCharCode = 65;
			endCharCode = 122;
		}else{
			startCharCode = 0x4E00;
			endCharCode = 0x9FA0;
		}
		for(;i < length; i ++){
			rndText.push(String.fromCharCode(startCharCode + Math.floor(Math.random() * (endCharCode - startCharCode))));
		}

		return rndText.join('');

	};

	SuperTextScrambler.prototype.end = function(){
		var sts = this;
		sts.$target
			.trigger('scramblerEnd');
	};

	$.extend({
		'SuperTextScrambler': function (text, options){
			return new SuperTextScrambler(text, options);
		}
	});
	$.fn.extend({
		'superTextScrambler':function (options){
			var sts = new SuperTextScrambler($(this).text(), options);
			sts.init($(this));
			sts.start();
			$(this).data('SuperTextScrambler', sts);
			return this;
		}
	});

}(this, jQuery));
