var ko = window.ko = {};
ko.observable = function (initialValue) {
	var _latestValue = initialValue;

	function observable(newValue) {
		if (arguments.length > 0) {
			_latestValue = newValue;
			observable.notifySubscribers(_latestValue);
		}
		return _latestValue;
	}

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

ko.applyBindingsToNode = function (viewModel, node) {
	var isFirstEvaluation = true;
	function evaluate() {
		var parsedBindings = parseBindingAttribute(node.getAttribute(bindingAttributeName), viewModel);
		for (var bindingKey in parsedBindings) {
			if (ko.bindingHandlers[bindingKey]) {
				if (isFirstEvaluation && typeof ko.bindingHandlers[bindingKey].init == "function") {
					ko.bindingHandlers[bindingKey].init(node, parsedBindings[bindingKey]);
					parsedBindings[bindingKey].subscribe(evaluate);
				}
				if (typeof ko.bindingHandlers[bindingKey].update == "function") {
					ko.bindingHandlers[bindingKey].update(node, parsedBindings[bindingKey]);
				}
				if (isFirstEvaluation) parsedBindings[bindingKey].subscribe(evaluate);
			}
		}
	}
	
	evaluate();
	isFirstEvaluation = false;
};

function parseBindingAttribute(attributeText, viewModel) {
	var bindings = {}, tmp = attributeText.split(',');
	for(var i = 0;i < tmp.length;i++) {
		var names = tmp[0].split(':'), handlerName = names[0], observableName = names[1];
		bindings[handlerName] = viewModel[observableName];
	}
	return bindings;
}