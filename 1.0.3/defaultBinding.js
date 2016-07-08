ko.bindingHandlers = {};

ko.bindingHandlers.text = {
	update: function (element, value) {
		element.innerText = value();
	}
};

ko.bindingHandlers.value = {
	init: function(element, value) {
		element.addEventListener("change", function () { value(this.value); }, false);
	},
	update: function (element, value) {
		element.value = value();
	}
};

ko.bindingHandlers.options = {
	update: function (element, value) {
		var value = value();
		element.innerHTML = "";
		for(var i = 0;i < value.length;i++) {
			var option = document.createElement("OPTION");
			option.value = value[i];
			option.innerHTML = value[i];
			element.appendChild(option);
		}
	}
};
