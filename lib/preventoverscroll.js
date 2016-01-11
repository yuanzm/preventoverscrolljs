/**
 * @author: zimyuan
 * @last-edit-date: 2016-01-11
 */

var _util = require('./util');

var doc            = document,
	win            = window,
	_defaultConfig = {
		list           : [],
		containerClass : 'prevent-overscroll-container',
		styleId        : 'prevent-overscroll-style',
		styleStr       : '{overflow-y: scroll; -webkit-overflow-scrolling: touch;}'
	};

function PreventOverScroll(options) {
	this.config        = _util.extend(_defaultConfig, options || {});
	this.startMoveYmap = {}; 

	this.init();
}

PreventOverScroll.prototype = {
	constructor: PreventOverScroll,

	init: function() {

		this._initStyle();                 
		this._initstartMoveMap.call(this);            
		this._bindEvent(this.config.list);

	},

	// append class name for HTMLElements
	_initStyle: function() {
		var i, il, item,
			list = this.config.list,
			that = this;

		if ( !_util.checkDeviceType('ios') )
			return;

		for ( i = 0, il = list.length; i < il; i++) {
			item = doc.getElementById(list[i]);

			if (!item)
				throw '';

			item.className += that.config.containerClass;
		}

		this._appendStyle();
	},

	// append new stylesheet to `head` tag
	_appendStyle: function() {
		if ( document.getElementById(this.config.styleId) )
			return;

		var style = doc.createElement('style');

		style.id        = this.config.styleId;
		style.innerHTML = '.' + this.config.containerClass + this.config.styleStr;

		doc.getElementsByTagName('head')[0].appendChild(style);
	},

	/**
	 * there's a map to record 
	 */ 
	_initstartMoveMap: function() {
		var map = this.config.list;

		for ( var i = 0, il = map.length; i < il; i++ )
			this.startMoveYmap[map[i]] = 0;
	},

	// 元素开始滑动的时候记录元素的起始位置
	_startMove: function(e) {
		var e = e || win.event;

		startMoveYmap[this.id] = e.touches[0].clientY;
	},

	// 防止过分拉动
	_preventMove: function(e) {
		// 高位表示向上滚动, 底位表示向下滚动: 1容许 0禁止
		var status       = '11',
			e            = e || window.event,
			ele          = this,
			currentY     = e.touches[0].clientY,
			startY       = startMoveYmap[ele.id],
			scrollTop    = ele.scrollTop,
			offsetHeight = ele.offsetHeight,
			scrollHeight = ele.scrollHeight;

		if (scrollTop === 0)
			// 如果内容小于容器则同时禁止上下滚动
			status = (  offsetHeight >= scrollHeight 
					  ? '00' 
					  : '01'  );

		else if ( scrollTop + offsetHeight >= scrollHeight )
			// 已经滚到底部了只能向上滚动
			status = '10';

		if ( status != '11' ) {
			// 判断当前的滚动方向
			var direction =(  currentY - startY > 0 
							? '10' 
							: '01'  );

			// 操作方向和当前允许状态求与运算，运算结果为0，就说明不允许该方向滚动，则禁止默认事件，阻止滚动
			if ( !( parseInt(status, 2) & parseInt(direction, 2) ) ) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
		}
	},

	// 绑定事件处理程序
	_bindEvent: function(eleArr) {
		var elem, _oSelf = this,
			error;

		for (var i = 0, il = eleArr.length; i < il; i++) {
			elem = document.getElementById(eleArr[i]);
			if (!elem) {
				error = 'elem ' + eleArr[i] + 'is not exist!';
				throw error;
			}

			_util.addEvent(elem, 'touchstart', _oSelf._startMove);
			_util.addEvent(elem, 'touchmove', _oSelf._preventMove);
		}
	},

	push: function(id) {
		var item;

		if ( id in this.startMoveYmap )
			return;

		this.config.list.push(id);
		startMoveYmap[id] = 0;
		item              = doc.getElementById(id);
		item.className    += this.config.containerClass;
		this._bindEvent([id]);
	},

	pop: function(id) {
		var _oSelf = this,
			elem   = doc.getElementById(id);

		delete startMoveYmap[id];
		_util.removeEvent(elem, 'touchstart', _oSelf.startMove);
		_util.removeEvent(elem, 'touchmove', _oSelf._preventMove);
	}
}

module.exports = PreventOverScroll;
