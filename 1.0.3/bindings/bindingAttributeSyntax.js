/** 绑定 **/
var bindingAttributeName = "data-bind";

// 绑定的入口
ko.applyBindingsToNode = function (viewModel, node) {
	var isFirstEvaluation = true;
	new ko.dependentObservable(function () {
			var parsedBindings = parseBindingAttribute(node.getAttribute(bindingAttributeName), viewModel);
			for (var bindingKey in parsedBindings) {
				if (ko.bindingHandlers[bindingKey]) {
					if (isFirstEvaluation && typeof ko.bindingHandlers[bindingKey].init == "function") {
						ko.bindingHandlers[bindingKey].init(node, parsedBindings[bindingKey], viewModel);
					}
					if (typeof ko.bindingHandlers[bindingKey].update == "function") {
						ko.bindingHandlers[bindingKey].update(node, parsedBindings[bindingKey], viewModel);
					}
				}
			}
		}, null);
	
	isFirstEvaluation = false;
};

// 解析html
function parseBindingAttribute(attributeText, viewModel) {
	var bindings = {}, tmp = attributeText.split(',');
	for(var i = 0;i < tmp.length;i++) {
		var names = tmp[0].split(':'), handlerName = names[0], observableName = names[1];
		bindings[handlerName] = viewModel[observableName] ? viewModel[observableName] : observableName;
	}
	return bindings;
}