## 自己动手写Knockoutjs - 判断observable对象的方法和更多的绑定
### 1. 测试用例
[https://github.com/bluemind7788/myknockout/blob/master/1.0.3/test.html](https://github.com/bluemind7788/myknockout/blob/master/1.0.3/test.html)
### 2. 判断一个对象是否是observable、dependentObservable

observable都是function对象，通过typeof、instanceof并不能判断出来。   
dependentObservable也是observable，需要判断为true。   
参考javascript的原型链，我们为observable添加一个__ko_proto__的属性，它来标识一个observable对象，它指向ko.observable。ko.observable也加一个__ko_proto__的属性，它指向它的父。

observable添加
``` javascript
observable.__ko_proto__ = ko.observable;
}
```
dependentObservable添加
``` javascript
dependentObservable.__ko_proto__ = ko.dependentObservable;
}
ko.dependentObservable.__ko_proto__ = ko.observable;
```
判断observable的方法
``` javascript
ko.isObservable = function(instance) {
	if(instance == null || instance == undefined || instance.__ko_proto__ == undefined) return false;
	if(instance.__ko_proto__ == ko.observable) return true;
	return ko.isObservable(instance.__ko_proto__);
}
```
### 3. click绑定
``` javascript
ko.bindingHandlers.click = {
	init: function(element, value, viewModel) {
		ko.utils.registerEventHandler(element, 'click', function(event) {
			try{
				value.call(viewModel);
			} finally {
				if(event.preventDefault) {
					event.preventDefault();
				} else {
					event.returnValue = false;
				}
			}
		})
	}
};
```
registerEventHandler是一个通用化的方法，我们放到utils里面。

``` javascript
registerEventHandler: function(element, eventType, handler) {
	if(element.addEventListener) {
		element.addEventListener(eventType, handler, false);
	} else if(element.attachEvent) {
		element.addEventListener('on' + eventType, function(event) {
			handler.call(element, event);
		});
	}
}
```
### 4. css绑定
``` javascript
ko.utils.css = {
	update: function(element, value, viewModel) {
		value = value || {};
		for(var className in value) {
			var shouldHasClass = value[className];
			ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
			
		}
	}
}
```
toggleDomNodeCssClass需要用类似于jquery操作样式常用的方法hasClass、addClass、removeClass等方法，我们都把他们加到utils里面，具体看源码。

``` javascript
toggleDomNodeCssClass : function(element, className, shouldHaveClass) {
	var hasClass = ko.utils.hasClass(element, className);
	if(shouldHaveClass && !hasClass) {
		ko.utils.addClass(element, className)
	} else if(!shouldHaveClass && hasClass){
		ko.utils.removeClass(element, className)
	}
}
```
### 
**具体的实现和例子，参照[https://github.com/bluemind7788/myknockout/tree/master/1.0.3](https://github.com/bluemind7788/myknockout/tree/master/1.0.3)**


