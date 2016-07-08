### 1. 测试用例
``` vbscript-html
<select id="select1" multiple="multiple" style="width: 200px" data-bind="options:items"></select>
<button onclick="addItem()">添加</button>
<button onclick="delLastItem()">删除最后一项</button>
<button onclick="reverse()">反转</button>

<script src="knockout.js"></script>
<script>
	var myViewModel = { };
       myViewModel.items = ko.observableArray(["Alpha", "Beta", "Gamma"])
	ko.applyBindingsToNode(myViewModel, document.getElementById('select1'));
	function addItem() {
		myViewModel.items.push('Added');
	}
	function delLastItem() {
		myViewModel.items.pop();
	}
	function reverse() {
		myViewModel.items.reverse();
	}
</script>
```
### 2. 可监控数组的定义
不同于一般的`observable`对象，可监控数组需要有更多的操作api，如push、pop等。这样，我们可以通过继承`observable`，然后再加入扩展的方法。
``` javascript
ko.observableArray = function(initialValues) {
	var result = new ko.observable(initialValues);
	return result;
}
```
### 3. 扩展方法的实现
通过result()可以得到原生的数组对象，在扩展方法里需要做两件事：操作原生数组；通知subscribtiones。
``` javascript
["pop", "push", "reverse", "shift", "sort", "splice", "unshift"].forEach(function(methodName) {
	result[methodName] = function() {
		var underlyingArray = result();
		var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
		result.valueHasMutated();
	    return methodCallResult;
	}
});
```
`valueHasMutated`的实现放在`observable`中。
``` javascript
observable.valueHasMutated = function () { 
	observable.notifySubscribers(_latestValue); 
}
```
对于像`slice`这样的方法，当其被调用时是不需要发出通知的。
``` javascript
['slice'].forEach(function(methodName) {
	result[methodName] = function() {
			var underlyingArray = result();
	           return underlyingArray[methodName].apply(underlyingArray, arguments);
		}
});
```
### 
具体的实现和例子，参照[https://github.com/bluemind7788/myknockout/tree/master/1.0.2](https://github.com/bluemind7788/myknockout/tree/master/1.0.2)