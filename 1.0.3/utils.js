ko.utils = {
	unwrapObservable: function(value) {
		return ko.isObservable(value) ? value() : value; 
	},
	registerEventHandler: function(element, eventType, handler) {
		if(element.addEventListener) {
			element.addEventListener(eventType, handler, false);
		} else if(element.attachEvent) {
			element.addEventListener('on' + eventType, function(event) {
				handler.call(element, event);
			});
		}
	},
	addClass : function(element, className) {
		if(ko.utils.hasClass(element, className)) return ;
		element.className = (element.className || "") + " " + className;
	},
	removeClass : function(element, className) {
		var names = (element.className || "").split(/\s+/);
		var resultArray = [];
		for(var i = 0, len = names.length;i < len;i++) {
			if(names[i] !== className) resultArray.push(names[i]);
		}
		element.className = resultArray.join(' ');
	},
	hasClass : function(element, className) {
		var currentClassNames = (element.className || "").split(/\s+/);
		return ko.utils.arrayIndexOf(currentClassNames, className) >= 0 ? true : false;
		
	},
	arrayIndexOf : function(array, item) {
		if(typeof array.indexOf === 'function') {
			return array.indexOf(item);
		} else {
			for(var i = 0, len = array.length;i < len;i++) {
				if(array[i] === item) {
					return i;
				}
			}
		}
		return -1;
	},
	toggleDomNodeCssClass : function(element, className, shouldHaveClass) {
		var hasClass = ko.utils.hasClass(element, className);
		if(shouldHaveClass && !hasClass) {
			ko.utils.addClass(element, className)
		} else if(!shouldHaveClass && hasClass){
			ko.utils.removeClass(element, className)
		}
	}
}