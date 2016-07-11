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

ko.bindingHandlers.visible = {
	update: function (element, value) {
		value = value();
		if(value) {
			element.style.display = 'block';
		} else {
			element.style.display = 'none';
		}
	}
};

ko.bindingHandlers.enable = {
	update: function (element, value) {
		value = value();
		if(value && element.disabled) {
			element.removeAttribute('disabled');
		} else if(!value && !element.disabled){
			element.disabled = true;
		}
	}
};

//ko.bindingHandlers.disable = {
//	update: function (element, value) {
//		ko.bindingHandlers.enable.update(element, value);
//	}
//};

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

ko.utils.css = {
	update: function(element, value, viewModel) {
		value = value || {};
		for(var className in value) {
			var shouldHasClass = value[className];
			ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
			
		}
	}
}

ko.bindingHandlers.click = {
	init: function(element, value, viewModel) {
		ko.utils.registerEventHandler(element, 'click', function(event) {
			try{
				value.call(viewModel);
			} finally {
				if(event.preventDefault) {
					event.preventDefault();
				} else {
					event.returnValue = false;
				}
			}
		})
	}
};
