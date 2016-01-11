/**
 * @author: zimyuan
 * @last-edit-date: 2016-01-11
 */

var _util = require('./util');

var doc            = document,
    win            = window,
    startMoveYmap  = {}, // 用于暂存元素开始滑动的起始位置
    _defaultConfig = {
        list           : [],
        containerClass : 'prevent-overscroll-container',
        styleId        : 'prevent-overscroll-style',
        styleStr       : '{overflow-y: scroll; -webkit-overflow-scrolling: touch;}'
    };

/*
 * 微信里面防止下拉`露底`组件
 * @param {Object} options: 组件配置
 *
 * 调用方法
 * 1. 引用组件对应的脚本文件
 * 2. 给需要设定防止拉动漏黑底的元素设置id
 * 3. 可以使用与window对象绑定的组件实例`preventOverScroll`,也可以自己实例化组件
 */
function PreventOverScroll(options) {
    // 通过深拷贝，扩展(替换)默认配置
    this.config = _util.extend(_defaultConfig, options);
    this.init();
}

PreventOverScroll.prototype = {
    constructor: PreventOverScroll,

    // 组件初始化
    init: function() {

        this._initStyle();                   // 添加辅助样式
        this._initstartMoveMap();            // 初始滑动起始位置
        this._bindEvent(this.config.list);   // 为组件元素绑定事件处理程序

    },

    // 为容器添加类名和样式
    _initStyle: function() {
        var i, il, item,
            that = this;

        if ( _util.checkDeviceType('ios') ) {

            for ( i = 0, il = this.config.list.length; i < il; i++) {
                item = doc.getElementById(this.config.list[i]);

                if (!item) {
                    continue;
                }

                item.className += that.config.containerClass;
            }

            this._appendStyle();
        }
    },

    // 为组件添加辅助样式
    _appendStyle: function() {
        if ( document.getElementById(this.config.styleId)) {
            return;
        };

        var style = doc.createElement('style');

        style.id        = this.config.styleId;
        style.innerHTML = '.' + this.config.containerClass + this.config.styleStr;
        doc.getElementsByTagName('head')[0].appendChild(style);
    },

    // 初始化所有元素的起始位置
    _initstartMoveMap: function() {
        var map = this.config.list;

        for ( var i = 0, il = map.length; i < il; i++) {
            startMoveYmap[map[i]] = 0;
        }
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

        if (scrollTop === 0) {
            // 如果内容小于容器则同时禁止上下滚动
            status = (  offsetHeight >= scrollHeight 
                      ? '00' 
                      : '01'  );
        } 

        else if ( scrollTop + offsetHeight >= scrollHeight ) {
            // 已经滚到底部了只能向上滚动
            status = '10';
        }

        if (status != '11') {
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
            addEvent(elem, 'touchstart', _oSelf._startMove);
            addEvent(elem, 'touchmove', _oSelf._preventMove);
        }
    },

    push: function(id) {
        var item;

        if (id in startMoveYmap) return;
        this.config.list.push(id);
        startMoveYmap[id] = 0;
        item = doc.getElementById(id);
        item.className += this.config.containerClass;
        this._bindEvent([id]);
    },

    pop: function(id) {
        var _oSelf = this,
            elem = doc.getElementById(id);

        delete startMoveYmap[id];
        removeEvent(elem, 'touchstart', _oSelf.startMove);
        removeEvent(elem, 'touchmove', _oSelf._preventMove);
    }
}
