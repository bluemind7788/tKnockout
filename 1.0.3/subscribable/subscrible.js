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
