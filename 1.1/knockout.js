/****************************************************************
 * 		 knockoutjs的实现
 * 		 实现第一步：双向绑定
 * 		 @by bluemind
 *****************************************************************/

var ko = window.ko = {};
ko.observable = function (initialValue) {
	var _latestValue = initialValue;

	function observable(newValue) {
		if (arguments.length > 0) {
			// set 方法
			_latestValue = newValue;
			observable.notifySubscribers(_latestValue);
		}
		return _latestValue;
	}
	// 继承ko.subscribable的方法
	ko.subscribable.call(observable);
	return observable;
}

ko.subscribable = function () {
	var _subscriptions = [];

	this.subscribe = function (callback) {
		_subscriptions.push(callback);
	};

	this.notifySubscribers = function (valueToNotify) {
		for(var i = 0; i < _subscriptions.length;i++) {
			_subscriptions[i](valueToNotify);
		}
	};
}

/** 绑定 **/
var bindingAttributeName = "data-bind";
ko.bindingHandlers = {};

ko.bindingHandlers.text = {
	update: function (element, value) {
		element.innerText = value();
	}
};

ko.bindingHandlers.value = {
	init: function(element, value) {
		element.addEventListener("change", function () { value(this.value); }, false);
	},
	update: function (element, value) {
		element.value = value();
	}
};

// 绑定的入口
ko.applyBindingsToNode = function (viewModel, node) {
	var isFirstEvaluation = true;
	function evaluate() {
		var parsedBindings = parseBindingAttribute(node.getAttribute(bindingAttributeName), viewModel);
		for (var bindingKey in parsedBindings) {
			if (ko.bindingHandlers[bindingKey]) {
				if (isFirstEvaluation && typeof ko.bindingHandlers[bindingKey].init == "function") {
					ko.bindingHandlers[bindingKey].init(node, parsedBindings[bindingKey]);
				}
				if (typeof ko.bindingHandlers[bindingKey].update == "function") {
					ko.bindingHandlers[bindingKey].update(node, parsedBindings[bindingKey]);
				}
				if (isFirstEvaluation) parsedBindings[bindingKey].subscribe(evaluate);// observe注册回调
			}
		}
	}
	
	evaluate();
	isFirstEvaluation = false;
};

// 解析html
function parseBindingAttribute(attributeText, viewModel) {
	var bindings = {}, tmp = attributeText.split(',');
	for(var i = 0;i < tmp.length;i++) {
		var names = tmp[0].split(':'), handlerName = names[0], observableName = names[1];
		bindings[handlerName] = viewModel[observableName];
	}
	return bindings;
}