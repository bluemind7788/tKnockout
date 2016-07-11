/****************************************************************
 * 		 knockoutjs的实现
 * 		 @by bluemind
 *****************************************************************/

ko.observable = function (initialValue) {
	var _latestValue = initialValue;

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
	observable.valueHasMutated = function () { observable.notifySubscribers(_latestValue); }
	// 继承ko.subscribable的方法
	ko.subscribable.call(observable);
	return observable;
}
