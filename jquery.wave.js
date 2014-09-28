(function($) {
	
	function Wave(options) {
		this.setOptions(options);
	};

	Wave.prototype = {
		constructor: Wave,
		// 设置参数
		setOptions: function(options) {
			var self = this;
			this.options = $.extend({
				element: null,
				className: 'wave', 				// 波的样式
				shape: 'rectangle', 			// 形状 [rectangle, circle]
				fromBorderColor: '#A2B4C4',		// 波初始的边框颜色
				toBorderColor: 'transparent',	// 波消失的边框颜色
				fromWidth: 0,					// 设置波源的宽度,只在[shape=rectangle]时有效,值为0则自动计算,取所选元素宽度值的一半
				fromHeight: 0,					// 设置波源的宽度,只在[shape=rectangle]时有效,值为0则自动计算,取所选元素高度值的一半
				fromBorderWidth: 0,				// 初始波宽度
				toBorderWidth: 5,				// 结束时波宽度
				fromBorderRadius: 0,			// 设置波源的边框radius,值为0则自动计算,当[shape=rectangle]时,值取2, 当[shape=circle]时,取所选元素高度和宽度中值最小的
				amplitude: 15, 					// 振幅 单位：px
				cycle: 1000,					// 周期 单位：毫秒
				frequency: 1, 					// 频率 单位：次数
				lifecycle: 4000,				// 波的生命值  单位：毫秒
				stopOnHover: true				// hover时是否停止动画
			}, this.options, options||{});

			this.element = $(this.options.element).css({position:"relative", zIndex: 1});
		},
		// 获取波源位置
		_getFromBounds: function() {
			var elemOffset = this.element.offset();
				elemWidth = this.element.outerWidth(true),
				elemHeight = this.element.outerHeight(true),
				fromWidth = elemWidth,
				fromHeight = elemHeight,
				fromBorderRadius = 0;

			if(this.options.shape == "rectangle") {
				fromWidth = this.options.fromWidth===0 ? elemWidth/2 : this.options.fromWidth;
				fromHeight = this.options.fromHeight===0 ? elemHeight/2 : this.options.fromHeight;
				fromBorderRadius = this.options.fromBorderRadius===0 ? 2 : this.options.fromBorderRadius;
			};
			if(this.options.shape == "circle") {
				fromBorderRadius = this.options.fromBorderRadius===0 ? Math.min(elemWidth, elemHeight)/2 : this.options.fromBorderRadius;
				fromWidth = fromHeight = fromBorderRadius*2;
			};

			return {
				width: fromWidth,
				height: fromHeight,
				top: elemOffset.top + (elemHeight - fromHeight)/2-1,
				left: elemOffset.left + (elemWidth - fromWidth)/2-1,
				radius: fromBorderRadius
			};
		},
		// 获取波消失位置
		_getToBounds: function() {
			var fromBounds = this._getFromBounds();
			return {
				width: fromBounds.width + this.options.amplitude*2,
				height: fromBounds.height + this.options.amplitude*2,
				top: fromBounds.top - this.options.amplitude-3,
				left: fromBounds.left - this.options.amplitude-3,
				radius: this.options.shape == "rectangle" ? fromBounds.radius : fromBounds.radius + this.options.amplitude
			};
		},		
		start: function() {
			var self = this;
			if(self.intervalId) {return};

			if(this.options.stopOnHover) {
				this.element.on("mouseenter", function(){
					self.stop(true);
				}).on("mouseleave", function() {
					self.start();
				});
			};

			self.intervalId = setInterval(function() {
				
				var fromBounds = self._getFromBounds(),
					toBounds = self._getToBounds(),
					line = $('<div></div>');

				line.css({
					position: "absolute",
					width: fromBounds.width,
					height: fromBounds.height,
					top: fromBounds.top,
					left: fromBounds.left,
					borderStyle: 'solid',
					zIndex: 0,
					borderWidth: self.options.fromBorderWidth,
					borderColor: self.options.fromBorderColor,
					borderRadius: fromBounds.radius
				}).addClass(self.options.className).appendTo(document.body);

				line.animate({
					width: toBounds.width,
					height: toBounds.height,
					top: toBounds.top,
					left: toBounds.left,
					borderWidth: self.options.toBorderWidth,
					borderColor: self.options.toBorderColor,
					borderRadius: toBounds.radius
				}, self.options.lifecycle, "easeOutBack", function() {
					line.remove();
				});

			}, self.options.cycle/self.options.frequency );
		},
		stop: function(stopOnHover) {
			if(this.intervalId != null) {
				clearInterval(this.intervalId);
				this.intervalId = null;
				if(stopOnHover!=true) {
					this.element.off("mouseenter mouseleave");
				}
			}
		}
	};

	$.fn.wave = function(options, params) {
		this.each(function() {
			var wave = $(this).data("wave");
			var isMethod = typeof options === "string";
			if(wave) {
				if(isMethod) {
					wave[options](params);
					return;
				} else {
					wave.setOptions(options);
				}
			} else {
				var opts = { element: this };
				opts = isMethod ? opts : $.extend({}, opts, options||{});
				wave = new Wave(opts);
				$(this).data("wave", wave);
				if(isMethod) {
					arguments.callee.call(this, options);
				};
			}
		});
		return this;
	};

})(jQuery);