// 可监控数组
ko.observableArray = function(initialValues) {
	var result = new ko.observable(initialValues);
	["pop", "push", "reverse", "shift", "sort", "splice", "unshift"].forEach(function(methodName) {
		result[methodName] = function() {
			var underlyingArray = result();
			var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
			result.valueHasMutated();
            return methodCallResult;
		}
	});
	['slice'].forEach(function(methodName) {
		result[methodName] = function() {
			var underlyingArray = result();
            return underlyingArray[methodName].apply(underlyingArray, arguments);
		}
	});
	return result;
}