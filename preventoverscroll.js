/*
 * @author: zimyuan
 * @last-edit-date: 2015-09-24
 * @depend: none
 */
;
(function(win, doc) {
    /*
     * 检测设备类型
     * @param {String} type: 设备类型代称: ios || android
     * @return {Boolean}: 检测结果
     */
    checkDeviceType = function(type) {
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
    addEvent = function(dom, eType, handler) {
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
    removeEvent = function(dom, eType, handler) {
        if (dom.removeEventListener) {
            dom.removeEventListener(eType, handler, false);
        } else if (dom.detachEvent) {
            dom.detachEvent('on' + eType, handler);
        } else {
            dom["on" + eType] = null;
        }
    }
    var startMoveYmap = {},             // 用于暂存元素开始滑动的起始位置
        styleId = 'prevent-overscroll', 
        styleStr = 'html, body {height: 100%} #wrapper {height: 100%; overflow-y: scroll; -webkit-overflow-scrolling: touch;}';

    /*
     * 微信里面放置下拉`露底`组件
     * 
     */
    function preventMoveOverScroll(idArr) {
        this.idArr = idArr;
        this.init();
    }
    preventMoveOverScroll.prototype = {
        // 组件初始化
        init: function() {
            this.initStyle();
            this.initstartMoveMap();
            this.bindEvent(this.idArr);
        },
        initStyle: function() {
            if (checkDeviceType('ios')) {
                this.appendStyle();
            }
        },
        // 为组件添加辅助样式
        appendStyle: function() {
            if (doc.getElementById(styleId)) return;
            var style = doc.createElement('style');
            style.id = styleId;
            style.innerHTML = styleStr;
            doc.getElementsByTagName('head')[0].appendChild(style);
        },
        // 初始化所有元素的起始位置
        initstartMoveMap: function() {
            var map = this.idArr;
            for (var i = 0, il = map.length;i < il;i++) {
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
                e = e || window.event, // 使用 || 运算取得event对象
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
                // console.log(direction);
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
            var elem, _oSelf = this;

            for (var i = 0,il = eleArr.length;i < il;i++) {
                elem = document.getElementById(eleArr[i]);
                addEvent(elem, 'touchstart', _oSelf.startMove);
                addEvent(elem, 'touchmove', _oSelf.preventMove);
            }
        },
        push: function(id) {

        },
        pop: function(id) {

        }
    }
    // 暴露接口
    win.checkDeviceType = checkDeviceType;      // for debug                
    win.preventMoveOverScroll = preventMoveOverScroll;
    win.preventMoveOverScroll = new preventMoveOverScroll(['wrapper']);
})(window, document)