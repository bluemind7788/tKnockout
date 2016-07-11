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
	observable.__ko_proto__ = ko.observable;
	observable.valueHasMutated = function () { observable.notifySubscribers(_latestValue); }
	// 继承ko.subscribable的方法
	ko.subscribable.call(observable);
	return observable;
}

ko.isObservable = function(instance) {
	if(instance == null || instance == undefined || instance.__ko_proto__ == undefined) return false;
	if(instance.__ko_proto__ == ko.observable) return true;
	return ko.isObservable(instance.__ko_proto__);
}
