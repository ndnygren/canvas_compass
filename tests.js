
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
		var log_entry = "";
		for(var i = 0; i < results.length; i++) {
			if (!results[i]) {
				log_entry += "test " + i + " failed.\n";
			}
		}
		if(log_entry != "") { console.log(log_entry); }
		return assocFoldr(numeric, function(a,b) {return a+b; })
			+ " tests out of " + numeric.length + " passed.";
	}
	// start polynomial tests
	this.tests.push(function() {
		var pc = new PolyCalc();
		var temp = [1,2,3,5];
		return pc.reduceArr(temp)[0] == 30;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var temp = [1,2,"x",3,5];
		return pc.reduceArr(temp)[1] == 30 && pc.reduceArr(temp)[0] == "x";
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		return pc.isConst(pc.num(6)[0]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		return !pc.isConst(pc.num("x")[0]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var num1 = pc.num(1), num2 = pc.num(2);
		return pc.eval(pc.add(num1, num2), 0) == (1+2);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var num3 = pc.num(3), num4 = pc.num(4);
		return pc.eval(pc.add(num3, num4), 0) == (3+4);
	});

	this.tests.push(function() {
		var pc = new PolyCalc();
		var num1 = pc.num(1), num2 = pc.num(2), num3 = pc.num(3), num4 = pc.num(4);
		return pc.eval(pc.mult(pc.add(num1, num2), pc.add(num3, num4)), 0) == (1+2)*(3+4);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var t1 = pc.add(pc.num(2), pc.num("x"));
		var t2 = pc.add(pc.num(-2), pc.num("x"));
		var t3 = pc.mult(t1,t2);
		var cls = pc.classifyTerms(t3,"x");
		return pc.eval(cls[2])== 1
			&& pc.eval(cls[1])== 0
			&& pc.eval(cls[0])== -4;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var mc = new MtxCalc();
		var p1 = [1,0,-1];
		var p2 = [-1,1];
		var obj = pc.coefDivide(p1,p2);
		return mc.vectEqual([],obj.r);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var mc = new MtxCalc();
		return mc.vectEqual(pc.coefMult([2,1],[1,1]), [2,3,1]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var mc = new MtxCalc();
		return mc.vectEqual(pc.coefMult([-2,1],[2,3,1]), [-4,-4,1,1]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var mc = new MtxCalc();
		return pc.rat(-1.44444444444444).n == -13;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var mc = new MtxCalc();
		var roots = pc.rationalRoots([2,3,1]);
		return mc.vectEqual(pc.coefMult(roots[0],roots[1]), [2,3,1]);
	});

	// start geometry tests
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

	// start matrix tests
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
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual(mc.scaleMtx(2,[[3,1,1],[-2,0,2]]), [[6,2,2],[-4,0,4]]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.vectEqual(mc.mtxVectMult([[1,0],[0,1]],[2,3]), [2,3]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.vectEqual(mc.mtxVectMult([[3,4],[5,6]],[2,3]), [18,28]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.vectEqual(mc.selectCol(1,[[3,4],[5,6],[2,3]]), [4,6,3]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual(mc.mtxMult([[1,2],[2,1]],[[1,2],[2,3]]),
			[[5,8],[4,7]]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual(mc.mtxCopy([[1,2],[3,4]]), [[1,2],[3,4]]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual([[1,0,0],[0,1,0],[0,0,1]], mc.makeId(3));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual(mc.reduce([[1,0,0],[0,1,0],[0,0,1]]), mc.makeId(3));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var comp = mc.makeId(3);
		comp[0][2] = -1;
		comp[1][2] = 2;
		comp[2][2] = 0;
		return mc.mtxEqual(mc.reduce([[1,2,3],[4,5,6],[7,8,9]]), comp);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual(mc.reduce([[1,2,3],[4,5,6],[7,8,10]]), mc.makeId(3));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.mtxEqual(mc.reduce([[1,2,3],[4,8,6],[7,8,9]]), mc.makeId(3));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var input =
			[[1,1/2,1/3,1,0,0],
			[1/2,1/3,1/4,0,1,0],
			[1/3,1/4,1/5,0,0,1]];
		var output =
			[[1,0,0,9,-36,30],
			[0,1,0,-36,192,-180],
			[0,0,1,30,-180,180]];
		return mc.mtxEqual(mc.reduce(input), output);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var input = [[1,2],[3,4]];
		var output = [[1,2,1,0],[3,4,0,1]];
		return mc.mtxEqual(mc.sideBySide(input, mc.makeId(2)),output);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var input = [[1,2],[3,4]];
		var output = [[1,2,1,0],[3,4,0,1]];
		return mc.mtxEqual(mc.leftSplit(output, 2),input);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var input = [[1,2],[3,4]];
		var output = [[1,2,1,0],[3,4,0,1]];
		return mc.mtxEqual(mc.rightSplit(output, 2), mc.makeId(2));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var input = [[1,1/2,1/3], [1/2,1/3,1/4], [1/3,1/4,1/5]];
		var output = [[9,-36,30], [-36,192,-180], [30,-180,180]];
		return mc.mtxEqual(mc.mtxMult(input,output),mc.makeId(3));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var input = [[1,1/2,1/3], [1/2,1/3,1/4], [1/3,1/4,1/5]];
		var output = [[9,-36,30], [-36,192,-180], [30,-180,180]];
		return mc.mtxEqual(input,mc.inverse(output));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var input = [[1,1/2,1/3], [1/2,1/3,1/4], [1/3,1/4,1/5]];
		var output = [[9,-36,30], [-36,192,-180], [30,-180,180]];
		return mc.mtxEqual(mc.mtxMult(output,mc.inverse(output)), mc.makeId(3));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx1 = [[1,2,3],[4,5,6],[7,8,9]];
		var mtx2 = [[1,4,7],[2,5,8],[3,6,9]];
		return mc.mtxEqual(mc.transpose(mtx1),mtx2);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx1 = [[1,2,3],[4,5,6],[7,8,9]];
		return mc.mtxEqual(mc.submatrix(mtx1,2,1), [[1,3],[4,6]]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx1 = [[1,2,3],[4,5,6],[7,8,9]];
		return mc.det(mtx1) == 0;
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx2 = [[1,2,3],[-4,5,6],[7,-8,9]];
		return mc.det(mtx2) == 240;
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx1 = [[1,0,0],[0,5,0],[0,0,9]];
		return mc.det(mtx1) == 45;
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx1 = [[1,0,0],[0,1,0],[0,0,1]];
		return mc.vectEqual(mc.characteristic(mtx1),[1,-3,3,-1]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		return mc.isZeroVect([0,0,0,0])
			&& !mc.isZeroVect([0,1,0,0]);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx = [[1,0,2,3],[0,1,0,4],[0,2,0,8],[0,3,0,12]];
		var basis = mc.kernelSpace(mtx);
		return mc.isZeroVect(mc.mtxVectMult(mtx,basis[0]),
			mc.mtxVectMult(mtx,basis[1]));
	});
}
