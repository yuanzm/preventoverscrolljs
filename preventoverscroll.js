/*
 * @author: zimyuan
 * @last-edit-date: 2015-11-27
 * @depend: none
 */
(function(win, doc) {
    'use strict';

    var startMoveYmap = {}, // 用于暂存元素开始滑动的起始位置
        // 组件默认配置
        _defaultConfig = {
            list           : [],
            containerClass : 'prevent-overscroll-container',
            styleId        : 'prevent-overscroll-style',
            styleStr       : '{overflow-y: scroll; -webkit-overflow-scrolling: touch;}'
        };
    /*
     * 微信里面放置下拉`露底`组件
     * @param {Object} options: 组件配置
     *
     * 调用方法
     * 1. 引用组件对应的脚本文件
     * 2. 给需要设定防止拉动漏黑底的元素设置id
     * 3. 可以使用与window对象绑定的组件实例`preventMoveOverScroll`,也可以自己实例化组件
     */
    function PreventMoveOverScroll(options) {
        // 通过深拷贝，扩展(替换)默认配置
        this.config = extend(_defaultConfig, options);
        this.init();
    }
    PreventMoveOverScroll.prototype = {
        // 组件初始化
        init: function() {
            this.initStyle();                   // 添加辅助样式
            this.initstartMoveMap();            // 初始滑动起始位置
            this.bindEvent(this.config.list);   // 为组件元素绑定事件处理程序
        },
        // 为容器添加类名和样式
        initStyle: function() {
            var i, il, item;

            if (checkDeviceType('ios')) {
                for (i = 0, il = this.config.list.length; i < il; i++) {
                    item = doc.getElementById(this.config.list[i]);
                    if (!item) continue;
                    item.className += ' prevent-overscroll-container';
                }
                this.appendStyle();
            }
        },
        // 为组件添加辅助样式
        appendStyle: function() {
            if (doc.getElementById(this.config.styleId)) return;
            var style = doc.createElement('style');
            style.id = this.config.styleId;
            style.innerHTML = '.' + this.config.containerClass + this.config.styleStr;
            doc.getElementsByTagName('head')[0].appendChild(style);
        },
        // 初始化所有元素的起始位置
        initstartMoveMap: function() {
            var map = this.config.list;
            for (var i = 0, il = map.length; i < il; i++) {
                startMoveYmap[map[i]] = 0;
            }
        },
        // 元素开始滑动的时候记录元素的起始位置
        startMove: function(e) {
            var e = e || win.event;

            startMoveYmap[this.id] = e.touches[0].clientY;
        },
        // 防止过分拉动
        preventMove: function(e) {
            // 高位表示向上滚动, 底位表示向下滚动: 1容许 0禁止
            var status = '11',
                e = e || window.event,
                ele = this,
                currentY = e.touches[0].clientY,
                startY = startMoveYmap[ele.id],
                scrollTop = ele.scrollTop,
                offsetHeight = ele.offsetHeight,
                scrollHeight = ele.scrollHeight;

            if (scrollTop === 0) {
                // 如果内容小于容器则同时禁止上下滚动
                status = offsetHeight >= scrollHeight ? '00' : '01';
            } else if (scrollTop + offsetHeight >= scrollHeight) {
                // 已经滚到底部了只能向上滚动
                status = '10';
            }
            if (status != '11') {
                // 判断当前的滚动方向
                var direction = currentY - startY > 0 ? '10' : '01';
                // 操作方向和当前允许状态求与运算，运算结果为0，就说明不允许该方向滚动，则禁止默认事件，阻止滚动
                if (!(parseInt(status, 2) & parseInt(direction, 2))) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
        },
        // 绑定事件处理程序
        bindEvent: function(eleArr) {
            var elem, _oSelf = this,
                error;

            for (var i = 0, il = eleArr.length; i < il; i++) {
                elem = document.getElementById(eleArr[i]);
                if (!elem) {
                    error = 'elem ' + eleArr[i] + 'is not exist!';
                    throw error;
                }
                addEvent(elem, 'touchstart', _oSelf.startMove);
                addEvent(elem, 'touchmove', _oSelf.preventMove);
            }
        },
        push: function(id) {
            var item;

            if (id in startMoveYmap) return;
            this.config.list.push(id);
            startMoveYmap[id] = 0;
            item = doc.getElementById(id);
            item.className += this.config.containerClass;
            this.bindEvent([id]);
        },
        pop: function(id) {
            var _oSelf = this,
                elem = doc.getElementById(id);

            delete startMoveYmap[id];
            removeEvent(elem, 'touchstart', _oSelf.startMove);
            removeEvent(elem, 'touchmove', _oSelf.preventMove);
        }
    }

    win.PreventMoveOverScroll = PreventMoveOverScroll;
    // win.preventMoveOverScroll = new PreventMoveOverScroll({
    //     list: ['container']
    // });
    // ----------------------------------------- 辅助函数 -------------------------------------------------
        /*
         * 检测设备类型
         * @param {String} type: 设备类型代称: ios || android
         * @return {Boolean}: 检测结果
         */
    function checkDeviceType(type) {
        var agent = navigator.userAgent,
            _isAndroid = /(Android)/i.test(agent),
            _isiOS = /(iPhone|iPad|iPod|iOS)/i.test(agent) && !_isAndroid;

        return type == 'ios' ? _isiOS : _isAndroid;
    }
    /*
     * 绑定事件处理程序的兼容性写法
     * @param {HTMLElement} dom: 需要绑定事件处理程序的DOM节点
     * @param {String} eType: 需要绑定的事件类型
     * @param {Function} handler: 绑定的事件 
     */
    function addEvent(dom, eType, handler) {
        if (dom.addEventListener) {
            dom.addEventListener(eType, handler, false);
        } else if (dom.attachEvent) {
            dom.attachEvent("on" + eType, handler);
        } else {
            dom["on" + eType] = handler;
        }
    }
    /*
     * 去除事件处理程序的兼容性写法
     * @param {HTMLElement} dom: 需要绑定事件处理程序的DOM节点
     * @param {String} eType: 需要绑定的事件类型
     * @param {Function} handler: 绑定的事件 
     */
    function removeEvent(dom, eType, handler) {
        if (dom.removeEventListener) {
            dom.removeEventListener(eType, handler, false);
        } else if (dom.detachEvent) {
            dom.detachEvent('on' + eType, handler);
        } else {
            dom["on" + eType] = null;
        }
    }
    /*
     * 判断JavaScript对象类型的函数
     * @param obj:任意的数据类型
     * @param {String} type: 对象类型 Array | Object | ... 
     */
    function is(obj, type) {
        var toString = Object.prototype.toString,
            undefined;
        return (type === 'Null' && obj === null) ||
            (type === "Undefined" && obj === undefined) ||
            toString.call(obj).slice(8, -1) === type;
    }
    /*
     * 深拷贝函数
     * @param {Object} oldObj: 被拷贝的对象
     * @param {Object} newObj: 需要拷贝的对象
     * @ return {Object} newObj: 拷贝之后的对象
     */
    function extend(oldObj, newObj) {
        for (var key in oldObj) {
            var copy = oldObj[key];
            if (oldObj === copy || key in newObj) continue; //如window.window === window，会陷入死循环，需要处理一下
            if (is(copy, "Object")) {
                newObj[key] = extend(copy, newObj[key] || {});
            } else if (is(copy, "Array")) {
                newObj[key] = [];
                newObj[key] = extend(copy, newObj[key] || []);
            } else {
                newObj[key] = copy;
            }
        }
        return newObj;
    }

    win.checkDeviceType = checkDeviceType;
})(window, document);
