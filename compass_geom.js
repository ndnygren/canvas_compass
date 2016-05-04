
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

function zippr(lhs, rhs, func) {
	if (lhs.length != rhs.length) {throw("zipping non-equal lengths");}
	var output = [];

	for (var i = 0; i < lhs.length; i++) {
		output.push(func(lhs[i],rhs[i]));
	}

	return output;
}

function CTNode(input) {
	this.name = input.replace(/[ \t]+$/, "").replace(/^[(), \t]+/,"");
	this.child = [];

	this.equalTo = function(rhs) {
		if (this.name != rhs.name) { return false; }
		if (this.child.length != rhs.child.length) { return false; }
		if (this.child.length == 0) { return true; }
		return assocFoldr(zippr(this.child, rhs.child, function(a,b) {
			return a.equalTo(b);
		}), function (a,b) { return a && b; } );
	}

	this.geomValid = function() {
		if (this.name == "point") { return this.pointValid(); }
		else if (this.name == "line") { return this.lineValid(); }
		else if (this.name == "circle") { return this.circleValid(); }
		else { return false; }
	}

	this.pointValid = function() {
		if (this.name != "point") { return false; }
		else if (this.child.length != 2) { return false; }
		else if (!isNaN(this.child[0].name)
				&& !isNaN(this.child[1].name))
		{ return true; }
		else if (this.child[0].lineOrCircleValid()
				&& this.child[1].lineOrCircleValid())
		{ return true; }
		return false;
	}

	this.lineOrCircleValid = function() {
		return this.lineValid() || this.circleValid();
	}

	this.lineValid = function() {
		if (this.name != "line") { return false; }
		else if (this.child.length != 2) { return false; }
		return this.child[0].pointValid() && this.child[1].pointValid();
	}

	this.circleValid = function() {
		if (this.name != "circle") { return false; }
		else if (this.child.length != 2) { return false; }
		return this.child[0].pointValid() && this.child[1].pointValid();
	}

	this.collect = function(cache, assignments) {
		var pc = new ProjectiveCalc();
		var newnode;
		if (this.name == "point"
			&& this.child.length == 2
			&& !isNaN(this.child[0].name)
			&& !isNaN(this.child[1].name)) {
				newnode = pc.pointNumeric(this.child[0].name, this.child[1].name);
				cache.point.push(newnode);
				return newnode;
		}
		newnode = pc.calcLayer(this.name, this.child.map(function(x) { return x.collect(cache,assignments); }), assignments);
		cache[newnode["type"]].push(newnode);
		return newnode;
	}
}

function ConstructParse() {
	this.nextToken = function(str, current, tok) {
		for (var i = current + 1; i < str.length; i++) {
			if (tok.indexOf(str[i]) >= 0) {
				return i;
			}
		}
		return -1;
	}

	this.trim = function(input){
		return input.replace(/[ \t]+$/, "").replace(/^[ \t]+/, "");
	}

	this.wsClean = function(input) {
		var output = "";
		for (var i = 0; i < input.length; i++) {
			output += input[i] == "\n" ? " " : input[i];
		}
		return output;
	}

	this.breakOnDelim = function(input, delim) {
		var output = [];
		var last = 0;
		for (var i = 0; i < input.length; i++) {
			if (input[i] == delim) {
				output.push(input.substring(last, i));
				last = i+1;
			}
		}
		output.push(input.substring(last, i));
		return output;
	}

	this.assignRead = function(input) {
		var cp  = this;
		var lines = cp.breakOnDelim(this.wsClean(input), ";");
		var output = lines.filter(function(x){
			return x.replace(/[ \t]+$/,"") != "";
		}).map(function(x){
			var lr = cp.breakOnDelim(x, "=");
			if (lr.length != 2) { throw("invalid assignment: " + x); }
			var tree = cp.read(lr[1]);
			tree.name = cp.trim(lr[0]);
			return {"name": tree.name, "tree": tree };
		});

		return output;
	}

	this.read = function(input) {
		var tree = new CTNode("top");
		var stack = [tree];
		var tokens = [",", "(", ")"];
		var str = this.wsClean(input);
		var cur = 0, next = this.nextToken(str, cur, tokens);
		var newtoken = "";
		for (cur = 0; cur < str.length && cur >= 0; next = this.nextToken(str, cur, tokens)) {
			newtoken = next > -1 ? str.substring(cur, next) : "";
			if (newtoken.replace(/^[,() \t]+/,"") != "") {
				stack[stack.length -1].child.push(new CTNode(newtoken));
			}
			if (str[next] == "(") {
				stack.push(stack[stack.length-1].child[stack[stack.length-1].child.length -1]);
			}
			else if (str[next] == ")") {
				if (stack.length == 1) { throw("Negative Bracket Balance."); }
				stack.pop();
			}
			cur = next;
		}

		if (stack.length != 1) { throw("stack size is " + stack.length + ". This probably means bracket imbalance."); }
		return stack[0];
	}

	this.htmlDebug = function(tree) {
		var pa = this;
		var output = "\"" + tree.name + "\"";
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

function ProjectiveCalc() {
	this.gauss_elim = function(mtx) {
		for(var k = 0; k < mtx.length; k++) {
		}
	}

	this.pointNumeric = function(x,y) {
		return {"type": "point",
			"x":parseFloat(x),
			"y":parseFloat(y)
		};
	}

	this.lineFrom2Points = function(a, b) {
		if (a.x==b.x && a.y==b.y) {throw("Need distinct points to make a line.")}
		return {"type":"line",
			"x1":a.x,
			"y1":a.y,
			"x2":b.x,
			"y2":b.y
		};
	}

	this.circleFrom2Points = function(p1,p2) {
		return {"type":"circle", "x":p1.x ,"y": p1.y, "r": this.d_euclid(p1,p2)};
	}

	this.heightOnLine = function(x, line) {
		if (line.x1 == line.x2) { throw("Vertical line."); }
		return (line.y2 - line.y1)/(line.x2 - line.x1)*(x - line.x1) + line.y1;
	}

	this.pointFrom2Lines = function(a,b) {
		var sa = a.y2 - a.y1; //rise on a
		var sb = b.y2 - b.y1; //rise on b
		var na = a.x2 - a.x1; //run on a
		var nb = b.x2 - b.x1; //run on b
		var ma = na*a.y1 - sa*a.x1 // tidy up a
		var mb = nb*b.y1 - sb*b.x1 // tidy up b
		if (sa*nb == sb*na) { throw("Parallel lines.");}
		var newx = (nb*ma - na*mb) / (na*sb - nb*sa);
		var newy = na!=0 ? this.heightOnLine(newx, a) : this.heightOnLine(newx, b);
		return this.pointNumeric(newx, newy);
	}

	this.fwdLineParam = function(line, t) {
		var s = line.y2 - line.y1; //rise
		var n = line.x2 - line.x1; //run
		return this.pointNumeric(n*t + line.x1, s*t + line.y1);
	}

	this.revLineParam = function(line, point) {
		var s = line.y2 - line.y1; //rise
		var n = line.x2 - line.x1; //run
		return n != 0 ? (point.x - line.x1)/n : (point.y - line.y1)/s;
	}

	this.d_euclid = function(p1, p2) {
		return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) +
				(p1.y-p2.y)*(p1.y-p2.y));
	}

	this.pointsFrom2Circles = function(a,b) {
		var D = this.d_euclid(a,b);
		var delta = Math.sqrt((D + a.r + b.r)*(-D + a.r + b.r)
				*(D + -a.r + b.r)*(D + a.r + -b.r))/4.0;
		var x1 = (a.x+b.x)/2 + (b.x-a.x)*(a.r*a.r - b.r*b.r)/(2*D*D)
			+ 2*(a.y-b.y)*delta/D/D;
		var x2 = (a.x+b.x)/2 + (b.x-a.x)*(a.r*a.r - b.r*b.r)/(2*D*D)
			- 2*(a.y-b.y)*delta/D/D;
		var y1 = (a.y+b.y)/2 + (b.y-a.y)*(a.r*a.r - b.r*b.r)/(2*D*D)
			- 2*(a.x-b.x)*delta/D/D;
		var y2 = (a.y+b.y)/2 + (b.y-a.y)*(a.r*a.r - b.r*b.r)/(2*D*D)
			+ 2*(a.x-b.x)*delta/D/D;
		//console.log("("+x1+","+y1+"),"+"("+x2+","+y2+")");
		return [this.pointNumeric(x1,y1),
			this.pointNumeric(x2, y2)];
	}

	this.pointFrom2Circles = function(a,b) {
		var points = this.pointsFrom2Circles(a,b);
		if (points.length == 0) { throw("These circles do not intersect."); }
		return points[0];
	}

	this.sign = function(x) { return x < 0 ? -1 : 1; }

	this.pointsFromLineCircle = function(line, circle) {
		if (line.type != "line" || circle.type != "circle") {
			throw("type error for lines and circles.");
		}
		var d = this.d_euclid(this.pointNumeric(line.x1,line.y1),
			this.pointNumeric(line.x2, line.y2));
		var dx = line.x2-line.x1;
		var dy = line.y2-line.y1;
		var D = (line.x1-circle.x)*(line.y2-circle.y)
			- (line.x2-circle.x)*(line.y1-circle.y);
		if (circle.r*circle.r*d*d - D*D < 0) { return []; }

		var x1 = (D*dy
			+ this.sign(dy)*dx*
				Math.sqrt(circle.r*circle.r*d*d - D*D))
			/ (d*d) + circle.x;
		var x2 = (D*dy - this.sign(dy)*dx*Math.sqrt(circle.r*circle.r*d*d - D*D))
			/ (d*d) + circle.x;
		var y1 = (-D*dx + Math.abs(dy)*Math.sqrt(circle.r*circle.r*d*d - D*D))
			/ (d*d) + circle.y;
		var y2 = (-D*dx - Math.abs(dy)*Math.sqrt(circle.r*circle.r*d*d - D*D))
			/ (d*d) + circle.y;
		//console.log("("+x1+","+y1+"),"+"("+x2+","+y2+")");

		return [this.pointNumeric(x1, y1),
		       this.pointNumeric(x2, y2)];
	}

	this.pointFromLineCircle = function(line, circle) {
		var points = this.pointsFromLineCircle(line, circle);
		if (points.length == 0) { throw("No intersection between line and circle."); }
		if (points.length == 1) { return points[0]; }
		else if (this.revLineParam(line, points[0])
				< this.revLineParam(line, points[1])) {
			return points[0];
		} else {
			return points[1];
		}
	}

	this.calcLayer = function(root, child, assignments) {
		if (root == "line") {
			if (child.length == 2 && child[0].type == "point") {
				return this.lineFrom2Points(child[0],child[1]);
			}
		}
		else if (root == "point") {
			if (child.length == 2
				&& child[0].type == "line"
				&& child[1].type == "line") {
				return this.pointFrom2Lines(child[0],child[1]);
			}
			else if (child.length == 2
				&& child[0].type == "circle"
				&& child[1].type == "circle") {
				return this.pointFrom2Circles(child[0],child[1]);
			}
			else if (child.length == 2
				&& child[0].type == "line"
				&& child[1].type == "circle") {
				return this.pointFromLineCircle(child[0],child[1]);
			}
			else if (child.length == 2
				&& child[0].type == "circle"
				&& child[1].type == "line") {
				return this.pointFromLineCircle(child[1],child[0]);
			}
		}
		else if (root == "circle") {
			if (child.length == 2
				&& child[0].type == "point"
				&& child[1].type == "point") {
				return this.circleFrom2Points(child[0],child[1]);
			}

		} else if (child.length == 0 && root in assignments) {
			return assignments[root];
		}
		console.log(JSON.stringify(assignments));
		throw("Unhandled layer, " + root + ", with " + JSON.stringify(child));
	}
}

function MtxCalc() {
	this.vectEqual = function(a,b) {
		if (a.length != b.length) { return false; }
		if (a.length == 0) { return true; }
		return assocFoldr(zippr(a,b, function(a,b) {
			return a==b;
		}), function(a,b) {
			return a && b;
		});
	}

	this.vectMult = function(a,b) {
		if (a.length != b.length) { throw("Vector size mismatch."); }
		return assocFoldr(zippr(a,b, function(a,b) {
			return a * b;
		}), function(a,b) {
			return a + b;
		});
	}

	this.vectAdd = function(a,b) {
		if (a.length != b.length) { throw("Vector size mismatch."); }
		return zippr(a,b, function(a,b) {
			return a + b;
		});
	}

	this.mtxEqual = function(a,b) {
		var mc = this;
		if (a.length != b.length) { return false; }
		if (a.length == 0) { return true; }
		return assocFoldr(zippr(a,b, function(a,b) {
			return mc.vectEqual(a,b);
		}), function(a,b) {
			return a && b;
		});
	}

	this.mtxAdd = function (a,b) {
		var mc = this;
		if (a.length != b.length) { throw("Vector size mismatch."); }
		return zippr(a,b, function(a,b) {
			return mc.vectAdd(a, b);
		});
	}
}

function geomTests() {
	var gt = this;
	this.tests = [];

	this.validityExamples = function(input, answer) {
		var cp = new ConstructParse();
		return cp.read(input).child[0].geomValid() == answer;
	}

	this.runTests = function() {
		var results = this.tests.map(function(x) { return x();});
		var numeric = results.map(function(x) { return x ? 1 : 0;});
		return assocFoldr(numeric, function(a,b) {return a+b; })
			+ " tests out of " + numeric.length + " passed.";
	}

	this.tests.push(function() { return gt.validityExamples(" line(point(1,0), point(0,1)) ", true); });
	this.tests.push(function() { return gt.validityExamples(" line(point(a,0), point(0,1)) ", false); });
	this.tests.push(function() { return gt.validityExamples(" line(point(1,0), point(0,a)) ", false); });
	this.tests.push(function() { return gt.validityExamples(" line(0,1) ", false); });
	this.tests.push(function() { return gt.validityExamples(" point(0,1) ", true); });
	this.tests.push(function() { return gt.validityExamples(" circle(0,1) ", false); });
	this.tests.push(function() { return gt.validityExamples(" circle(point(),1) ", false); });
	this.tests.push(function() { return gt.validityExamples(" circle(point(2,3),point(line(point(3,6),point(3,45)), circle(point(2,4),point(3,5)))) ", true); });
	this.tests.push(function() {
		var pc = new ProjectiveCalc();
		var p1 = pc.pointFrom2Lines(
			{"type":"line", "x1":0, "y1":0, "x2":0, "y2":2},
			{"type":"line", "x1":3, "y1":0, "x2":1, "y2":1});
		return p1.x == 0 && p1.y == 1.5;
	});
	this.tests.push(function() {
		var pc = new ProjectiveCalc();
		var line = {"type":"line", "x1":1, "y1": 1, "x2":3, "y2":2};
		var p1 = pc.fwdLineParam(line, 3);
		return p1.x == 7 && p1.y == 4;
	});
	this.tests.push(function() {
		var pc = new ProjectiveCalc();
		var line = {"type":"line", "x1":1, "y1": 1, "x2":3, "y2":2};
		var p1 = {"type":"point", "x":7, "y": 4};
		return pc.revLineParam(line, p1) == 3;
	});
	this.tests.push(function() {
		var pc = new ProjectiveCalc();
		var p1 = {"type":"point", "x":7, "y": 4};
		var p2 = {"type":"point", "x":4, "y": 8};
		return pc.d_euclid(p1,p2) == 5;
	});
	this.tests.push(function() {
		var pc = new ProjectiveCalc();
		var c1 = {"type":"circle", "x":0, "y": 0, "r":1};
		var c2 = {"type":"circle", "x":1, "y": 1, "r":1};
		var p1 = pc.pointFrom2Circles(c1,c2);
		return Math.abs(p1.x-0) < 0.01 && Math.abs(p1.y-1) < 0.01;
	});
	this.tests.push(function() {
		var pc = new ProjectiveCalc();
		var c1 = {"type":"circle", "x":2, "y": 1, "r":1};
		var l1 = {"type":"line", "x1": 5, "y1": 5, "x2":6, "y2":6};
		var p1 = pc.pointFromLineCircle(l1,c1);

		return Math.abs(p1.x-1) < 0.01 && Math.abs(p1.y-1) < 0.01;
	});
	this.tests.push(function() {
		var pc = new ProjectiveCalc();
		var c1 = {"type":"circle", "x":2, "y": 1, "r":1};
		var l1 = {"type":"line", "x1": 5, "y1": 5, "x2":-1, "y2":-1};
		var p1 = pc.pointFromLineCircle(l1,c1);

		return Math.abs(p1.x-2) < 0.01 && Math.abs(p1.y-2) < 0.01;
	});

	this.tests.push(function() {
		var str = "point( line(point(1,0), point(0,1)), line(point(2,0), point(2,1)))";
		var cp = new ConstructParse();
		var tree = cp.read(str).child[0];
		var cache = {"point":[], "line":[], "circle":[]};
		var collection = tree.collect(cache);
		//console.log(JSON.stringify(collection) + "\n" + JSON.stringify(cache));

		return collection.x==2 && collection.y==-1;
	});
	this.tests.push(function() {
		var str = "a;aasd;sfdd";
		var cp = new ConstructParse();
		var arr = cp.breakOnDelim(str, ";");
		return arr[1]=="aasd" && arr.length==3;
	});
	this.tests.push(function() {
		var str = "a;aasd;";
		var cp = new ConstructParse();
		var arr = cp.breakOnDelim(str, ";");
		return arr[2]=="" && arr.length==3;
	});
	this.tests.push(function() {
		var str = ";aasd;qrs";
		var cp = new ConstructParse();
		var arr = cp.breakOnDelim(str, ";");
		return arr[0]=="" && arr.length==3;
	});
	this.tests.push(function() {
		var str = "a;;qrs";
		var cp = new ConstructParse();
		var arr = cp.breakOnDelim(str, ";");
		return arr[1]=="" && arr.length==3;
	});
	this.tests.push(function() {
		var str = "a=a;qrs=65;";
		var cp = new ConstructParse();
		var arr = cp.assignRead(str);
		return arr.length == 2 && arr[0].name=="a";
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var out = mc.vectMult([1,2,3],[3,2,1]);
		return out == 10;
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.vectEqual([1,2,3],[1,2,3]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return !mc.vectEqual([3,2,1],[1,2,3]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return !mc.vectEqual([1,2],[1,2,3]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.vectEqual(mc.vectAdd([3,2,1],[-2,0,2]), [1,2,3]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual([[3,2,1],[-2,0,2]], [[3,2,1],[-2,0,2]]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return !mc.mtxEqual([[3,1,1],[-2,0,2]], [[3,2,1],[-2,0,2]]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual(mc.mtxAdd([[3,1,1],[-2,0,2]], [[3,2,1],[-2,0,2]]), [[6,3,2],[-4,0,4]]);
	});

}

