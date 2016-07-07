## 1. 计算属性的定义
先来看下官方文档中计算属性如何使用的。
``` javascript
var myViewModel = { };
myViewModel.firstName = ko.observable("Bob");
myViewModel.lastName = ko.observable("Smith");
myViewModel.fullName = ko.dependentObservable(function () {
return myViewModel.firstName() + " " + myViewModel.lastName();
			})
```
参照`observable`的定义，先写出一个基本的。
``` javascript
ko.dependentObservable = function(evaluatorFunction, evaluatorFunctionTarget) {
	var _lastValue;
	
	function dependentObservable() {
		return _lastValue;
	}
	ko.subscribable.call(dependentObservable);
	return dependentObservable;
}
```
### 2.  `evaluate`方法
`evaluatorFunction`是计算属性的计算方法，需要用它来给`_lastValue`重新赋值。通过`call`方法可以定义`evaluatorFunction`中的`this`。
`evaluatorFunction`是计算属性所依赖的属性变化时需要执行的方法，它的执行需要注册到其依赖属性的`subscribtiones`中，并且还要通知这个计算属性的变化到依赖于它的计算属性。这样，我们需要一个包装方法`evaluate`，它是`observable`对象发生变化时的需要执行的`subscribtiones`。
代码如下：
``` javascript
ko.dependentObservable = function(evaluatorFunction, evaluatorFunctionTarget) {
	var _lastValue;
	function evaluate() {
		_lastValue = evaluatorFunctionTarget ? evaluatorFunction.call(evaluatorFunctionTarget) : evaluatorFunction();
		
		dependentObservable.notifySubscribers(_lastValue);
	}
	
	function dependentObservable() {
		return _lastValue;
	}
	ko.subscribable.call(dependentObservable);
	evaluate();
	
	return dependentObservable;
}
```
### 3. 依赖收集的基本原理
计算属性我们定义好了，接下来就是依赖收集了。
依赖收集就是给`observable`对象（计算属性也算`observable`对象）注册计算属性的`evaluate`方法。
收集的时机就是在执行`evaluate`方法时，当调用`observable`对象的get方法时，需要将这个`observable`对象收集暂存起来，这样我们就得到了计算属性所依赖的`observable`对象的列表，然后我们需要给列表中的每个`observable`对象注册这个计算属性的`evaluate`方法。当所有的计算属性的`evaluate`方法都执行完一遍时，每个`observable`对象就都具有了依赖于它的计算属性的`evaluate`方法。

### 4. 收集暂存箱的实现
收集暂存箱需要在开始的时候初始化一个数组，结束的时候返回这个数组。
``` javascript
ko.dependencyDetection = (function () {
    var _detectedDependencies = [];
    return {
        begin: function () {
            _detectedDependencies.push([]);
        },

        end: function () {
            return _detectedDependencies.pop();
        },

        registerDependency: function (subscribable) {
            if (_detectedDependencies.length > 0) {
                _detectedDependencies[_detectedDependencies.length - 1].push(subscribable);
            }
        }
    };
})();
```
这里我们用一个闭包实现了变量的缓存，`_detectedDependencies`是一个长度为1的数组，用它的`pop`方法可以巧妙地实现在`end`的时候消除当前收集数组的依赖并返回这个数组。
### 5. 依赖收集的具体实现
首先在`observable`对象的get方法中用暂存器收集。
``` javascript
function observable(newValue) {
	if (arguments.length > 0) {
		// set 方法
		_latestValue = newValue;
		observable.notifySubscribers(_latestValue);
	} else {
		// get 方法
		ko.dependencyDetection.registerDependency(observable);
	}
	return _latestValue;
}
```
``` javascript
function dependentObservable() {
	ko.dependencyDetection.registerDependency(dependentObservable);
	return _lastValue;
}
```
所有的计算属性的依赖收集都只发生一次，就是在定义计算属性时，我们加入`_isFirstEvaluation`来标识是否是第一次。
``` javascript
var _lastValue,_isFirstEvaluation = true;
function evaluate() {
	_isFirstEvaluation && ko.dependencyDetection.begin();
	_lastValue = evaluatorFunctionTarget ? evaluatorFunction.call(evaluatorFunctionTarget) : evaluatorFunction();
	_isFirstEvaluation && replaceSubscriptionsToDependencies(ko.dependencyDetection.end());
	
	dependentObservable.notifySubscribers(_lastValue);
	_isFirstEvaluation = false;
}
```
给收集列表中的每个`observable`对象注册计算属性的`evaluate`方法。
``` javascript
function replaceSubscriptionsToDependencies(dependencies) {
dependencies.forEach(function(dependence) {
		dependence.subscribe(evaluate);
	});
}
```
**计算属性和依赖收集算是mvvm中的核心和难点，具体实现代码和测试例子见：[https://github.com/bluemind7788/myknockout/tree/master/1.0.1](https://github.com/bluemind7788/myknockout/tree/master/1.0.1)**

