
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
		return pc.isConst([6]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		return !pc.isConst([0,1]);
	});
	this.tests.push(function() {
		var cll = new CoefLL();
		var num1 = [1], num2 = [2];
		return cll.singleEqual(cll.singleAdd(num1, num2), [1+2]);
	});
	this.tests.push(function() {
		var cll = new CoefLL();
		var num3 = [3], num4 = [4];
		return cll.singleEqual(cll.singleAdd(num3, num4), [3+4]);
	});

	this.tests.push(function() {
		var pc = new CoefLL();
		var num1 = [1], num2 = [2], num3 = [3], num4 = [4];
		return pc.singleEqual(pc.singleMult(pc.singleAdd(num1, num2), pc.singleAdd(num3, num4)), [(1+2)*(3+4)]);
	});
	this.tests.push(function() {
		var pc = new CoefLL();
		var t1 = pc.singleAdd([2], [0,1]);
		var t2 = pc.singleAdd([-2], [0,1]);
		var t3 = pc.singleMult(t1,t2);
		var cls = t3;
		return cls[2] == 1
			&& cls[1] == 0
			&& cls[0] == -4;
	});
	this.tests.push(function() {
		var c = new CoefLL();
		return !c.singleEqual(c.zero, c.one);
	});
	this.tests.push(function() {
		var c = new CoefLL();
		var p = [0,6,2,43,2];
		return c.singleEqual(c.singleAdd(p,c.addInv(p)), c.zero);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var c = new CoefLL();
		var p1 = [1,0,-1];
		var p2 = [-1,1];
		var obj = pc.coefDivide(p1,p2);
		return c.singleEqual(c.zero,obj.r);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var c = new CoefLL();
		return c.singleEqual(c.singleMult([2,1],[1,1]), [2,3,1,0,0]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var c = new CoefLL();
		return c.singleEqual(c.singleMult([-2,1,0,0],[2,3,1]), [-4,-4,1,1]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var c = new CoefLL();
		return c.singleEqual(c.singleAdd([-2,1],[2,3,1]), [0,4,1]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		return pc.rat(-1.44444444444444).n == -13;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var roots = pc.rationalRoots([2,3,1]);
		var c = new CoefLL();
		return c.singleEqual(c.singleMult(roots[0],roots[1]), [2,3,1]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		return pc.gcd(12,8) == 4 && pc.gcd(12,7)==1;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		return pc.gcdArray([6,15,99]) == 3;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var mc = new MtxCalc();
		var arr = [ [0,0,0], [1,1,0], [2,0,1], [3,2,0], [4,1,1], [5,0,2], [6,3,0], [7,2,1], [8,1,2] ];
		var output = true;
		for (var i = 0; i < arr.length; i++) {
			output = output && mc.vectEqual(pc.pairBijection(arr[i][0]),[arr[i][1], arr[i][2]]);
		}
		return output;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var p;
		var accum = true;
		for (var i = 0; i < 100; i++) {
			p = pc.pairBijection(i);
			j = pc.pairBijectionRev(p[0],p[1]);
			accum = accum && (i==j);
		}
		return accum;
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		return pc.gcd(-1,3) == 1 && pc.gcd(0,3) == 3;
	});
	this.tests.push(function() {
		var cll = new CoefLL();
		var pc = new PolyCalc();
		var x = [0,1];
		var fact = cll.singleAdd(cll.singleMult([2],x), [-1]);
		var coef = cll.singleMult(fact,fact);
		var refact = pc.factor(coef);
		return refact.length == 2 && refact[0].length == 2
			&& cll.singleEqual(refact[0],[-1,2]);
	});
	this.tests.push(function() {
		var pc = new PolyCalc();
		var mc = new MtxCalc();
		var c = new CoefLL();
		var p = c.singleMult(c.singleMult([-2,0,1],[-5,0,1]),[1,1]);
		var fact = pc.factor(p);
		return mc.vectEqual(fact[0],[-2,0,1])
			|| mc.vectEqual(fact[1],[-2,0,1])
			|| mc.vectEqual(fact[2],[-2,0,1]);
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
		var pc = new PolyCalc();
		var mtx1 = [[1,0,0],[0,1,0],[0,0,1]];
		var chr = mc.characteristic(mtx1);
		var norm = pc.coefNormalize(chr.map(function (x) { return [{"n":[x], "d":[1]}];}));
		return mc.vectEqual(norm,[-1,3,-3,1]);
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
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx = [[1,0,2,3],[0,1,0,4],[0,2,0,8],[0,3,0,12]];
		var eig = mc.eigenValues(mtx);
		eig.sort( function(a,b){return a-b;});
		return mc.vectEqual([0,0,1,13], eig);
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx = [[1,0,2,3],[0,1,0,4],[0,2,0,8],[0,3,0,12]];
		var ev = mc.eigenVectors(mtx,0);
		return mc.isZeroVect(mc.mtxVectMult(mtx,ev[0]))
			&&  mc.isZeroVect(mc.mtxVectMult(mtx,ev[1]));
	});
	this.tests.push(function() {
		var mc = new MtxCalc();
		var mtx = [[1,0,2,3],[0,1,0,4],[0,2,0,8],[0,3,0,12]];
		var ev = mc.eigenVectors(mtx,13);
		return mc.vectEqual(mc.mtxVectMult(mtx,ev[0]),mc.scaleVect(13, ev[0]));
	});
	this.tests.push(function() {
		var cl = new ComplexLL();
		var x= {"r":1,"c":2};
		return cl.singleEqual(cl.singleAdd(x,cl.addInv(x)),cl.zero);
	});
	this.tests.push(function() {
		var cl = new ComplexLL();
		return cl.singleEqual({"r":1,"c":2},{"r":1,"c":2})
			&& !cl.singleEqual({"r":1,"c":2},{"r":1,"c":-2})
			&& !cl.singleEqual({"r":1,"c":2},{"r":-1,"c":2});
	});
	this.tests.push(function() {
		var cl = new ComplexLL();
		return cl.singleEqual(cl.singleMult({"r":0,"c":2},{"r":0,"c":14}),{"r":-28,"c":0})
			&& cl.singleEqual(cl.singleMult({"r":0,"c":2},{"r":7,"c":0}),{"r":0,"c":14});
	});
	this.tests.push(function() {
		var cl = new ComplexLL();
		var x= {"r":5,"c":2};
		return cl.singleEqual(cl.singleMult(x,cl.multInv(x)),cl.one);
	});
	this.tests.push(function() {
		var fl = new FracLL();
		var x = {"n": 5, "d": 7};
		return fl.singleEqual({"n": 5, "d": 7},x)
			&& !fl.singleEqual({"n": 5, "d": 6},x)
			&& !fl.singleEqual({"n": 5, "d": 8},x);
	});
	this.tests.push(function() {
		var fl = new FracLL();
		var x = {"n": 5, "d": 7};
		return fl.singleEqual(fl.singleMult(x,fl.multInv(x)),fl.one)
			&& fl.singleEqual(fl.singleAdd(x,fl.addInv(x)),fl.zero);
	});
}
