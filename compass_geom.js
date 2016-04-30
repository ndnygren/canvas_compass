
function assocFoldr(list, func) {
	if (!list || list.length == 0) {
		throw("assocFoldr does not take empty list.");
	}
	var output = list[0];
	for (var i = 1; i < list.length; i++) {
		output = func(output, list[i]);
	}
	return output
}

function CTNode(input) {
	this.name = input;
	this.child = [];
}

function ConstructParse() {
	this.read = function() {
		var output = new CTNode("top");
		output.child.push(new CTNode("banana"));
		output.child[0].child.push(new CTNode("orange"));
		output.child.push(new CTNode("avacado"));
		return output;
	}

	this.htmlDebug = function(tree) {
		var pa = this;
		var output = tree.name;
		if (tree.child.length > 0) {
			output += "<ul>";
			output += assocFoldr(tree.child.map(function (x) {
				return "<li>" + pa.htmlDebug(x) + "</li>";
			}), function (a,b) { return a + b; });
			output += "</ul>";
		}
		return output;
	}
}


