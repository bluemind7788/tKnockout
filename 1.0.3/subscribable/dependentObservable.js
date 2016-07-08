// 计算属性
ko.dependentObservable = function(evaluatorFunction, evaluatorFunctionTarget) {
	var _lastValue,_isFirstEvaluation = true;
	function evaluate() {
		_isFirstEvaluation && ko.dependencyDetection.begin();
		_lastValue = evaluatorFunctionTarget ? evaluatorFunction.call(evaluatorFunctionTarget) : evaluatorFunction();
		_isFirstEvaluation && replaceSubscriptionsToDependencies(ko.dependencyDetection.end());
		
		dependentObservable.notifySubscribers(_lastValue);
		_isFirstEvaluation = false;
	}
	
	function replaceSubscriptionsToDependencies(dependencies) {
		dependencies.forEach(function(dependence) {
			dependence.subscribe(evaluate);
		});
	}
	
	function dependentObservable() {
		ko.dependencyDetection.registerDependency(dependentObservable);
		return _lastValue;
	}
	ko.subscribable.call(dependentObservable);
	evaluate();
	
	return dependentObservable;
}