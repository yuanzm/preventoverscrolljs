(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/preventoverscroll');

},{"./lib/preventoverscroll":2}],2:[function(require,module,exports){
/**
 * @author: zimyuan
 * @last-edit-date: 2016-01-15
 */

var _util = require('./util');

var doc            = document,
	win            = window,
	startMoveYmap  = {},
	_defaultConfig = {
		list           : [],
		containerClass : 'prevent_over_scroll_container',
		styleId        : 'prevent_over_scroll_style',
		styleStr       : '{overflow-y: scroll; -webkit-overflow-scrolling: touch;}'
	};

function PreventOverScroll(options) {
	this.config        = _util.extend(_defaultConfig, options || {});

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

	_initstartMoveMap: function() {
		var map = this.config.list;

		for ( var i = 0, il = map.length; i < il; i++ )
			startMoveYmap[map[i]] = 0;
	},
	
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
		var elem, that = this,
			error;

		for (var i = 0, il = eleArr.length; i < il; i++) {
			elem = document.getElementById(eleArr[i]);
			if (!elem) {
				error = 'elem ' + eleArr[i] + 'is not exist!';
				throw error;
			}

			_util.addEvent(elem, 'touchstart', that._startMove);
			_util.addEvent(elem, 'touchmove', that._preventMove);
		}
	},

	push: function(id) {
		var item;

		if ( id in startMoveYmap )
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

module.exports = {
	PreventOverScroll: PreventOverScroll
};

},{"./util":3}],3:[function(require,module,exports){
/*
 * @author: yuanzm
 * @last-edit-date: 2016-01-15
 */
 
function checkDeviceType(type) {
    var agent 	   = navigator.userAgent,
        _isAndroid = /(Android)/i.test(agent),
        _isiOS     = /(iPhone|iPad|iPod|iOS)/i.test(agent) && !_isAndroid;

    return (  type == 'ios' 
    	    ? _isiOS 
    	    : _isAndroid  );
}

function addEvent(dom, eType, handler) {
    if ( dom.addEventListener ) {
        dom.addEventListener(eType, handler, false);
    }

    else if ( dom.attachEvent ) {
        dom.attachEvent("on" + eType, handler);
    } 

    else {
        dom["on" + eType] = handler;
    }
}

function removeEvent(dom, eType, handler) {
    if ( dom.removeEventListener ) {
        dom.removeEventListener(eType, handler, false);
    } 

    else if ( dom.detachEvent ) {
        dom.detachEvent('on' + eType, handler);
    } 

    else {
        dom["on" + eType] = null;
    }
}

function is(obj, type) {
    var toString = Object.prototype.toString,
        undefined;

    return (  type === 'Null' 
    		&& obj === null  ) 
    	   ||
		   (  type === "Undefined" 
		   	&& obj === undefined  ) 
		   ||
		   (  toString.call(obj).slice(8, -1) === type  );
}

function extend(oldObj, newObj) {
    for (var key in oldObj) {
        var copy = oldObj[key];

        if (  oldObj === copy 
        	|| key in newObj  ) {
        	continue; //如window.window === window，会陷入死循环，需要处理一下
        }

        if ( is(copy, "Object") ) {
            newObj[key] = extend(copy, newObj[key] || {});
        }

        else if (is(copy, "Array")) {
            newObj[key] = [];
            newObj[key] = extend(copy, newObj[key] || []);
        }

        else {
            newObj[key] = copy;
        }
    }

    return newObj;
}

var util = {
	checkDeviceType : checkDeviceType,
	addEvent 	    : addEvent,
	removeEvent 	: removeEvent,
	extend   		: extend
};

module.exports = util;

},{}],4:[function(require,module,exports){
window.PreventOverScroll = require('./index.js').PreventOverScroll;

},{"./index.js":1}]},{},[4]);
