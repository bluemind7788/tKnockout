ko.bindingHandlers.template = {
	update: function(element, value, viewModel) {
		var templateId = value;
		new ko.dependentObservable(function() {
			var renderedNodesArray = $.tmpl(document.getElementById(templateId).text, viewModel);
			renderedNodesArray.forEach(function(renderedNode) {
				element.appendChild(renderedNode)
			})
		});
		
	}
}
