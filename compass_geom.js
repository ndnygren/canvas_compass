
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

function DefaultLL() {
	this.zero = 0.0;
	this.one = 1.0;
	this.singleAdd = function (a,b) { return a+b; }
	this.singleMult = function (a,b) { return a*b; }
	this.singleEqual = function(a,b) { return Math.abs(a-b) < 0.000001; }
	this.abs = function(x) { return Math.abs(x); }
	this.order = function(a,b) { return a < b; }
	this.multInv = function(x) { return 1/x; }
	this.addInv = function(x) { return -x; }
	this.num = function(x) { return x; }
}

function CoefLL(low) {
	this.ll = !low ? new DefaultLL() : low;
	this.zero = [this.ll.zero];
	this.one = [this.ll.one];
	this.singleAdd = function (a,b) {
		var output = [];
		for (var i = 0; i < a.length || i < b.length; i++) {
			output.push(this.ll.singleAdd(
				i < a.length ? a[i] : this.ll.zero,
				i < b.length ? b[i] : this.ll.zero
			));
		}
		return output;
	}
	this.singleMult = function (lhs,rhs) {
		var output = [];
		for (var i = 0; i < lhs.length+rhs.length-1; i++) {
			output.push(0);
		}
		for (var i = 0; i < lhs.length; i++) {
			for (var j = 0; j < rhs.length; j++) {
				output[i+j] = this.ll.singleAdd(output[i+j], this.ll.singleMult(lhs[i], rhs[j]));
			}
		}
		return output;
	}
	this.singleEqual = function(a,b) {
		for (var i = 0; i < a.length || i < b.length; i++) {
			if (i >= a.length && !this.ll.singleEqual(this.ll.zero, b[i])) {
				return false;
			}
			else if (i >= b.length && !this.ll.singleEqual(this.ll.zero, a[i])) {
				return false;
			}
			else if (i < a.length && i < b.length && !this.ll.singleEqual(b[i], a[i])) {
				return false;
			}
		}
		return true;
	}
	this.abs = function(x) { return x.length > 0 ? this.ll.abs(x[0]) : this.ll.abs(this.ll.zero); }
	this.order = function(a,b) { return this.ll.order(a.length, b.length); }
	this.multInv = function(x) { throw("No multiplicative inverses for polynomials: " + JSON.stringify(x)); }
	this.addInv = function(x) { var ll = this.ll; return x.map(function(y) {return ll.addInv(y); }); }
}

function ComplexLL(low) {
	this.ll = !low ? new DefaultLL() : low;
	this.zero = {"r":this.ll.zero, "c":this.ll.zero};
	this.one = {"r":this.ll.one, "c":this.ll.zero};
	this.singleAdd = function (a,b) { return {"r":this.ll.singleAdd(a.r,b.r), "c":this.ll.singleAdd(a.c,b.c)}; }
	this.singleMult = function (a,b) { return {"r": this.ll.singleAdd(this.ll.singleMult(a.r,b.r), this.ll.addInv(this.ll.singleMult(a.c,b.c))),
		"c": this.ll.singleAdd(this.ll.singleMult(a.c,b.r), this.ll.singleMult(a.r,b.c))  }; }
	this.singleEqual = function(a,b) { return  this.ll.singleEqual(a.r,b.r) && this.ll.singleEqual(a.c, b.c); }
	this.abs = function(x) { return this.ll.abs(x.r) + this.ll.abs(x.c); }
	// no proper order for this
	this.order = function(a,b) { return this.ll.order(a.r, b.r); }
	this.multInv = function(x) {
		var denom = this.ll.singleAdd(this.ll.singleMult(x.r,x.r),this.ll.singleMult(x.c,x.c));
		denom = this.ll.multInv(denom);
		return {"r": this.ll.singleMult(x.r,denom), "c": this.ll.singleMult(this.ll.addInv(x.c),denom)};
	}
	this.addInv = function(x) { return {"r":this.ll.addInv(x.r), "c":this.ll.addInv(x.c)}; }
}

function FracLL(low) {
	this.ll = !low ? new DefaultLL() : low;
	this.zero = {"n": this.ll.zero, "d":this.ll.one};
	this.one = {"n": this.ll.one, "d":this.ll.one};
	this.singleAdd = function (a,b) {
		return {"n": this.ll.singleAdd(this.ll.singleMult(a.n,b.d),this.ll.singleMult(b.n,a.d)), "d": this.ll.singleMult(a.d,b.d) };
	}
	this.singleMult = function (a,b) { return {"n":this.ll.singleMult(a.n,b.n), "d":this.ll.singleMult(a.d,b.d)}; }
	this.singleEqual = function(a,b) { return this.ll.singleEqual(this.ll.singleMult(a.n,b.d), this.ll.singleMult(b.n,a.d)); }
	this.abs = function(x) { return this.ll.abs(x.n)/this.ll.abs(x.d); }
	this.order = function(a,b) { return this.ll.order(this.ll.singleMult(a.n,b.d), this.ll.singleMult(b.n,a.d)); }
	this.multInv = function(x) { return {"n": x.d, "d": x.n}; }
	this.addInv = function(x) { return {"n": this.ll.addInv(x.n),"d": x.d}; }
}


function MtxCalc(low) {
	this.ll = !low ? new DefaultLL() : low;

	this.vectEqual = function(a,b) {
		var mc = this;
		if (a.length != b.length) { return false; }
		if (a.length == 0) { return true; }
		return assocFoldr(zippr(a,b, function(a,b) {
			return mc.ll.singleEqual(a,b);
		}), function(a,b) {
			return a && b;
		});
	}

	this.vectMult = function(a,b) {
		var mc = this;
		if (a.length != b.length) { throw("Vector size mismatch."); }
		return assocFoldr(zippr(a,b, function(a,b) {
			return mc.ll.singleMult(a,b);
		}), function(a,b) {
			return mc.ll.singleAdd(a,b);
		});
	}

	this.vectAdd = function(a,b) {
		var mc = this;
		if (a.length != b.length) { throw("Vector size mismatch."); }
		return zippr(a,b, function(a,b) {
			return mc.ll.singleAdd(a,b);
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

	this.scaleVect = function(s, vect) {
		var mc = this;
		return vect.map(function(x) { return mc.ll.singleMult(s,x); });
	}

	this.scaleMtx = function(s, mtx) {
		var mc = this;
		return mtx.map(function(x) {return mc.scaleVect(s,x);});
	}

	this.mtxVectMult = function(mtx, vect) {
		var mc = this;
		return mtx.map(function(row) { return mc.vectMult(row,vect); });
	}

	this.selectCol = function(col,mtx) {
		return mtx.map(function(row) {
			return row[col];
		});
	}

	this.cols = function(mtx) {
		if (mtx.length == 0) { return 0;}
		return mtx[0].length;
	}

	this.mtxMult = function(m1, m2) {
		if (this.cols(m1) != m2.length) { throw("attempting to multiply a " + m1.length + "by" + this.cols(m1) + " with a " + m2.length + "by" + this.cols(m2)); }
		var output = [];
		for (var row = 0; row < m1.length; row++) {
			output.push([]);
			for (var col = 0; col < this.cols(m2); col++){
				output[row].push(this.ll.zero);
				output[row][col] = this.vectMult(m1[row], this.selectCol(col,m2));
			}
		}
		return output;
	}

	this.vectCopy = function(x) {
		return x.map(function(x) { return x; });
	}

	this.mtxCopy = function(x) {
		var mc = this;
		return x.map(function(x) { return mc.vectCopy(x); });
	}

	this.makeZero = function(dim) {
		var output = [];
		for (var i = 0; i < dim ; i++) {
			output.push([]);
			for (var j = 0; j < dim; j++) {
				output[i].push(this.ll.zero);
			}
		}
		return output;
	}

	this.makeId = function(dim) {
		var output = this.makeZero(dim);
		for (var i = 0; i < dim; i++) {
			output[i][i] = this.ll.one;
		}
		return output;
	}

	this.swapHighestMagOnRow = function(row, mtx) {
		var max = this.ll.abs(mtx[row][row]), maxidx = row;
		var temp;
		for (var k = row+1; k < mtx.length; k++) {
			if (this.ll.abs(mtx[k][row]) > max){
				max = this.ll.abs(mtx[k][row]);
				maxidx = k;
			}
		}
		temp = mtx[row];
		mtx[row] = mtx[maxidx]
		mtx[maxidx] = temp;
	}

	this.reduce = function(mtx) {
		var output = this.mtxCopy(mtx);
		var temp;
		for (var row = 0; row < mtx.length; row++) {
			this.swapHighestMagOnRow(row,output);
			if (!this.ll.singleEqual(output[row][row], this.ll.zero)) {
				output[row] = this.scaleVect(this.ll.multInv(output[row][row]), output[row]);
			}
			for (var k = 0; k < mtx.length; k++) {
				if (k != row && !this.ll.singleEqual(output[k][row], this.ll.zero)) {
					temp = this.scaleVect(this.ll.addInv(output[k][row]), output[row]);
					output[k] = this.vectAdd(temp, output[k]);
				}

			}
		}
		return output;
	}

	this.sideBySide = function(a,b) {
		return zippr(a,b, function(x,y) { return x.concat(y); } )
	}

	this.leftSplit = function(mtx, size) {
		if (size > this.cols(mtx)) { throw ("size("+size+") must be smaller than number of columns.\n" + JSON.stringify(mtx)); }
		return mtx.map(function(x) { return x.slice(0,size); })
	}

	this.rightSplit = function(mtx, size) {
		if (size > this.cols(mtx)) { throw ("size("+size+") must be smaller than number of columns.\n" + JSON.stringify(mtx)); }
		return mtx.map(function(x) { return x.slice(x.length-size,x.length); })
	}

	this.inverse = function(mtx) {
		if (mtx.length != this.cols(mtx)) {throw ("only square matrices have inverses");}
		var start = this.sideBySide(mtx, this.makeId(mtx.length));
		return this.rightSplit(this.reduce(start), mtx.length);
	}

	this.transpose = function(mtx) {
		var output = [];

		for (var i = 0; i < this.cols(mtx); i++) {
			output.push([]);
			for (var j = 0; j < mtx.length; j++) {
				output[i].push(mtx[j][i]);
			}
		}

		return output;
	}

	this.submatrix = function(mtx, i, j) {
		var output = mtx.slice(0,i).concat(mtx.slice(i+1));
		return output.map(function(x) {return x.slice(0,j).concat(x.slice(j+1)) });
	}

	this.mtxToPoly = function(mtx) {
		var pc = new PolyCalc();
		return mtx.map(function(x) {
			return x.map(function(y) {
				return pc.num(y);
			});
		});
	}

	// this is the determinant by cofactor expansion.
	this.det = function(mtx) {
		var accum = this.ll.zero;
		var parity;
		if (!mtx || mtx.length != this.cols(mtx)) {
			throw("Must be square matrix.");
		}
		if (mtx.length == 1) { return mtx[0][0]; }
		else if (mtx.length == 2) {
			return this.ll.singleAdd(this.ll.singleMult(mtx[0][0],mtx[1][1]), this.ll.singleMult(this.ll.addInv(this.ll.one),this.ll.singleMult(mtx[0][1],mtx[1][0])));
		}

		for (var i = 0; i < mtx.length; i++) {
			parity = i%2==0 ? this.ll.one : this.ll.addInv(this.ll.one);
			accum = this.ll.singleAdd(accum,this.ll.singleMult(parity, this.ll.singleMult(mtx[0][i],this.det(this.submatrix(mtx,0,i)))));
		}

		return accum;
	}

	this.characteristic = function(mtx) {
		var minusone = this.ll.addInv(this.ll.one);
		var newll = new CoefLL(this.ll);
		var newmc = new MtxCalc(newll);
		var temp = mtx.map(function (x) {
			return x.map(function(y) {
				return [y];
			});
		});
		for (var i = 0; i < mtx.length; i++) {
			temp[i][i].push(minusone);
		}
		return newmc.det(temp);
	}

	this.isZeroVect = function(input) {
		var mc = this;
		return assocFoldr(input.map(function(x) {
			return mc.ll.singleEqual(x, mc.ll.zero);
		}), function (a,b) {
			return a && b;
		});
	}
	this.kernelSpace = function(input) {
		var mc = this;
		var output = [];
		var temp;
		var mtx = this.transpose(this.reduce(input));
		for (var i = 0; i < mtx.length; i++) {
			if (mtx[i][i] == 0) {
				temp = mtx[i].map(function(x) { return mc.ll.addInv(x); });
				temp[i] = mc.ll.one;
				output.push(temp);
			}
		}
		return output;
	}

	this.eigenValues = function(input) {
		var mc = this;
		if (input.length != this.cols(input)) {
			throw(JSON.stringify(input) + " is not a square matrix.");
		}

		var pc = new PolyCalc();
		var chp = this.characteristic(input);
		var factors = pc.factor(chp);
		var roots = factors.map(function(x) {
			if (!x || x.length != 2 || isNaN(x[0])) {
				throw("failed to factor: " + JSON.stringify(x));
			}
			return mc.ll.singleMult(mc.ll.addInv(x[0]),mc.ll.multInv(x[1]));
		});
		return roots;
	}
	// takes a matrix and one of the previously
	// discovered eigenvalues as argument
	this.eigenVectors = function(input, ev) {
		var size = input.length;
		var mtx2 = this.mtxAdd(input, this.scaleMtx(this.ll.addInv(ev), this.makeId(size)));
		return this.kernelSpace(mtx2);
	}
}

function PolyCalc() {
	this.isConst = function(input) {
		return this.degree(input)+1 <= 1;
	}

	this.degree = function(arr) {
		var max = 0;
		for (var i=0; i < arr.length; i++) {
			if (arr[i] != 0) { max = i; }
		}
		return max;
	}

	this.leadingCoef = function (arr) {
		var max = this.degree(arr);
		return arr.length > max ? arr[max] : 0;
	}

	// Euclidean division of polynomials
	this.coefDivide = function (num,denom) {
		var mc = new MtxCalc();
		var output = {"q":[0], "r":mc.vectCopy(num)};
		var d = this.degree(denom);
		var c = this.leadingCoef(denom);
		var s, mag;

		while (this.degree(output.r) >= d) {
			s = this.leadingCoef(output.r)/c;
			mag = this.degree(output.r)-d;
			output.q[mag] = output.q[mag] ? output.q[mag] + s : s;
			for (var i = 0; i < denom.length; i++) {
				output.r[i+mag] -= s*denom[i];
			}
		}
		for (var i = 0; i < output.q.length; i++) {
			output.q[i] = output.q[i] == null ? 0 : output.q[i];
		}
		while (output.r.length > 0 && output.r[output.r.length-1]==0) {
			output.r.pop();
		}

		return output;
	}

	// floating point to integer pair conversion using continued fractions.
	this.rat = function(input) {
		var d_arr = [];
		var remd = input, whole = 0, temp;
		var output = {"n": 0, "d" : 1};
		for (var i = 0; i < 5 && remd != 0; i++) {
			whole = Math.floor(remd);
			d_arr.push(whole);
			remd -= whole;
			if (Math.abs(remd) > 0.0001) { remd = 1.0 / remd; }
			else { remd = 0; }
		}
		if (d_arr.length == 0) { return output; }
		else {
			output.n = d_arr[d_arr.length - 1];
			d_arr.pop();
		}
		for (var i = d_arr.length - 1; i>= 0; i--) {
			temp = output.n;
			output.n = output.d;
			output.d = temp;
			output.n += d_arr[i] * output.d;
		}

		return output;
	}

	this.rationalRoots = function(input) {
		var output = [];
		var temp;
		var accum = input;
		for (var j = 1; j <= Math.abs(input[input.length-1]); j++) {
			for (var i = 0; i*i <= Math.abs(input[0]); i++) {
				if (i === 0 || (j != 0 && accum[0] % i == 0
						&& accum[accum.length-1] % j == 0)) {
					temp = this.coefDivide(accum, [-i, j]);
					if (temp.r.length == 0) {
						output.push([-i,j]);
						accum = temp.q;
					}
					temp = this.coefDivide(accum, [i, j]);
					if (temp.r.length == 0) {
						output.push([i,j]);
						accum = temp.q;
					}
				}
			}
		}
		if (accum.length > 1 && output.length == 0) {
			output.push(accum);
		} else if (accum.length > 1) {
			 output = output.concat(this.rationalRoots(accum));
		}

		return output;
	}
	this.gcd = function(a,b) {
		var l = Math.max(Math.abs(a), Math.abs(b));
		var r = Math.min(Math.abs(a), Math.abs(b));
		var temp;
		while (r > 0) {
			temp = l%r;
			l = r;
			r = temp;
		}
		return l;
	}
	this.gcdArray = function(arr) {
		var pc = this;
		return assocFoldr(arr, pc.gcd);
	}

	// find the quadratic factors of a coef array polynomial.
	// specifcally the ones without rational roots.
	this.findQuadFactors = function(input) {
		if (input.length < 4) { return [input]; }
		var pc = this;
		var a = 1, b = 0, c = 0, temp, result, comb;
		for (var i = 0; a <= this.leadingCoef(input) + 1; i++) {
			temp = this.pairBijection(i);
			c = temp[0] + 1;
			temp = this.pairBijection(temp[1]);
			b = temp[0];
			a = temp[1] + 1;
			if (input[0] % c == 0 && this.leadingCoef(input) % a == 0){
				comb = [[c,b,a],[-c,b,a],[c,-b,a],[-c,-b,a]];
				result = comb.map(function (x) {return pc.coefDivide(input, x); } );
				for (var j in result) {
					if (result[j].r.length == 0) {
						return [result[j].q, comb[j]];
					}
				}
			}
		}
		return [input];
	}

	this.factor = function (input) {
		var pc = this;
		var fact = this.rationalRoots(input).map(function(x) {return pc.findQuadFactors(x);});
		return assocFoldr(fact, function(a,b){return a.concat(b);});
	}

	this.pairBijection = function(x) {
		var n = Math.floor(Math.sqrt(2*x + 1/4) - 1/2);
		var r = x - (n*n+n)/2;
		var l = n - r;
		return [l,r];
	}
	this.pairBijectionRev = function(l,r) {
		var n = l+r;
		return ((n*n+n)/2) +r;
	}

	this.coefNormalize = function(arr) {
		var mc = new MtxCalc();
		var numers = arr.map(function(x) {return x[0]["n"][0]; });
		var denoms = arr.map(function(x) {return x[0]["d"][0]; });
		var global_d = assocFoldr(denoms, function(a,b) {return a*b;});
		var temp = numers.map(function (x) { return x*global_d; });
		var g = this.gcdArray(temp);
		if (temp[temp.length-1] < 0) { g *= -1; }
		return temp.map(function(x) { return x / g; });
	}
}


