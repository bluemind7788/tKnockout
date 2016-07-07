了解一个开源的框架可以到网上看教程，要达到将框架运用到炉火纯青的地步就必须要了解其本身的原理，了解原理最好的方式莫过于自己亲手来实现一个简化的版本。
这边博客就教大家如何实现一个简化版本的Knockout， Knockout的源码现在已经有五千多行，这个版本的ko仅有**七十行**，实现了基本的双向数据绑定、两个绑定（value、text）。
#### 1. 实现`ko.observable`
ko对象是一个function对象
``` javascript
ko.observable = function (initialValue) {
	function observable(newValue) {
	}
	return observable;
}
```
要想知道数据发生了变化，必须要保存之前的数据，在这里可以用闭包保存老数据。
``` javascript
ko.observable = function (initialValue) {
var _latestValue = initialValue;
function observable(newValue) {
		if (arguments.length > 0) {
			_latestValue = newValue;
			observable.notifySubscribers(_latestValue);
		}
		return _latestValue;
	}
	return observable;
}
```
在ko中对于数据的set和get方法，可以通过参数的多少来判断，当有参数传入时，即是set方法。
数据变化的监听用观察者模式实现。
``` javascript
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
```
在`ko.observable`用`call`来继承`ko.subscribable`的属性，`ko.subscribable.call(observable);`。
#### 2. 自定义绑定的实现
自定义绑定要定义两件事情：数据变化时操作dom来改变视图；监听dom的变化，定义变化后去改变数据的方法。
``` javascript
ko.bindingHandlers.value = {
	init: function(element, value) {
		element.addEventListener("change", function () { value(this.value); }, false);
	},
	update: function (element, value) {
		element.value = value();
	}
};
```
#### 3. `ko.applyBindings` 的实现
`ko.applyBindings` 是view和model 绑定的入口。它需要1. 解析html代码中的绑定 2.执行自定义绑定中的init 3. 给model注册监听，监听的回调要做的事情是调用自定义绑定的update方法。
这里仅实现了单个dom node和model的绑定。
``` javascript
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

```
完整的代码和测试例子见[https://github.com/bluemind7788/myknockout/tree/master/1.0.0](https://github.com/bluemind7788/myknockout/tree/master/1.0.0)