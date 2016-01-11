/*
 * @author: yuanzm
 * @last-edit-date: 2016-01-11
 */

/*
 * 检测设备类型
 * @param {String} type: 设备类型代称: ios || android
 * @return {Boolean}: 检测结果
 */
function checkDeviceType(type) {
    var agent 	   = navigator.userAgent,
        _isAndroid = /(Android)/i.test(agent),
        _isiOS     = /(iPhone|iPad|iPod|iOS)/i.test(agent) && !_isAndroid;

    return (  type == 'ios' 
    	    ? _isiOS 
    	    : _isAndroid  );
}

/*
 * 绑定事件处理程序的兼容性写法
 * @param {HTMLElement} dom: 需要绑定事件处理程序的DOM节点
 * @param {String} eType: 需要绑定的事件类型
 * @param {Function} handler: 绑定的事件 
 */
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

/*
 * 去除事件处理程序的兼容性写法
 * @param {HTMLElement} dom: 需要绑定事件处理程序的DOM节点
 * @param {String} eType: 需要绑定的事件类型
 * @param {Function} handler: 绑定的事件 
 */
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

/*
 * 判断JavaScript对象类型的函数
 * @param obj:任意的数据类型
 * @param {String} type: 对象类型 Array | Object | ... 
 */
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

/*
 * 深拷贝函数
 * @param {Object} oldObj: 被拷贝的对象
 * @param {Object} newObj: 需要拷贝的对象
 * @ return {Object} newObj: 拷贝之后的对象
 */
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
