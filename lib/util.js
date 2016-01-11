/*
 * @author: yuanzm
 * @last-edit-date: 2016-01-11
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
