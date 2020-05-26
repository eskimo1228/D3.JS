var innArr = [], router = [], lineData = [];
var imageLoader;

var work;
var mdt;
var mask;
var size;
var limit;
var tCount;
var m_regions = [];
var temp_mask;
const INF = 1E20;

function vecMul(elem, item1, item2)
{
	vec1 = {"x" : item1.x - elem.x, "y" : item1.y - elem.y};
	vec2 = {"x" : item2.x - elem.x, "y" : item2.y - elem.y};
	var res = vec1.x * vec2.y - vec1.y * vec2.x;
	if (res > 0)
		return 1;
	else if (res < 0)
		return -1;
	return 0;
}

function calcHypotenuse(elem1, elem2) {
	return Math.sqrt(Math.pow(elem2.x-elem1.x, 2) + Math.pow(elem2.y-elem1.y, 2));
}

function isInside(x, y) 
{
    if (x >= 0 && y >= 0 && x < size.width && y < size.height)
        return true;
    return false;
}

function dt(prf, prd, n)
{
	var v = new Array(n);
	var z = new Array(n + 1);
	var k = 0;
	v[0] = 0;
	z[0] = -INF;
	z[1] = +INF;
	var q;
	for (q = 1; q <= n - 1; q++)
	{
		var s = ((prf[q] + Math.pow(q, 2)) - (prf[v[k]] + Math.pow(v[k], 2))) / (2 * q - 2 * v[k]);
		while (s <= z[k])
		{
			k--;
			s = ((prf[q] + Math.pow(q, 2)) - (prf[v[k]] + Math.pow(v[k], 2))) / (2 * q - 2 * v[k]);
		}
		k++;
		v[k] = q;
		z[k] = s;
		z[k + 1] = +INF;
	}

	k = 0;
	for (q = 0; q <= n - 1; q++)
	{
		while (z[k + 1] < q)
			k++;
		prd[q] = Math.pow(q - v[k], 2) + prf[v[k]];
	}

	delete v;
	delete z;
}

function dtFunc()
{
    var i, j;
    var f = [], d = [];
    for (i = 0; i < Math.max(size.width, size.height); i ++)
    {
        f[i] = 0;
        d[i] = 0;
    }

    // transform along columns
    for (i = 0; i < size.width; i ++)
    {
        for (j = 0; j < size.height; j ++)
            f[j] = mdt[j][i];
        dt(f, d, size.height);
        for (j = 0; j < size.height; j ++)
        {
            mdt[j][i] = d[j];
        }
    }

	// transform along rows
    for (i = 0; i < size.height; i ++)
    {
        for (j = 0; j < size.width; j ++)
            f[j] = mdt[i][j];
        dt(f, d, size.width);
        for (j = 0; j < size.width; j ++)
            mdt[i][j] = d[j];
    }
    delete f;
    delete d;
}

function calcDrawers()
{
    router[0].forEach(element => {
        var curve = [];
        
        var index1 = element.start;
        var index2 = element.end;
        var amplitude = 2.5;
        var increase = Math.PI / 2, counter = Math.PI / 2, alpha = 0;
        radius = calcHypotenuse( m_regions[index1-1].center, m_regions[index2-1].center) / 8;
        for(i=0; i<=140; i+=15)
        {
            deltaX = (m_regions[index2-1].center.x - m_regions[index1-1].center.x) * i / 180;
            offsetY = (m_regions[index2-1].center.y - m_regions[index1-1].center.y ) / (m_regions[index2-1].center.x - m_regions[index1-1].center.x) * deltaX;
            deltaY=  Math.sin(counter / amplitude ) * radius + offsetY;
            counter += increase ;
            let direction = 1;
            if(m_regions[index2-1].center.x < m_regions[index1-1].center.x )
                direction = -1;
            middle = {x: m_regions[index1-1].center.x + deltaX, y: m_regions[index1-1].center.y + deltaY};
            curve.push( middle);
        }
        lineData.push(curve);
    })
    // for (var i = 1; i < innArr.length; i ++)
    // {
    //     var curve = [];
    //     curve.push({"x" : m_regions[i - 1].center.x, "y" : m_regions[i - 1].center.y});
    //     curve.push({"x" : m_regions[i].center.x, "y" : m_regions[i].center.y});
    //     lineData.push(curve);
    // }
}

function initWork()
{
    var i, j;
    mdt = [];
    mask = [];
    for(i=0; i<size.height; i++) {
        mdt[i] = [];
        for(j=0; j<size.width; j++) {
            mdt[i][j] = 0;
        }
    }
    for(i=0; i<size.height; i++) {
        mask[i] = [];
        for(j=0; j<size.width; j++) {
            if (i == 0 || j == 0 || i == size.height - 1 || j == size.width - 1)
                mask[i][j] = 1;
            else
                mask[i][j] = 0;
        }
    }
    
    tCount = 0;
}

function searchPosition()
{
    var i, j, idx = 0;
    if (m_regions.length < 5)
    {
        var vidx = [];
        count = size.width * size.height / 10;
        mdt.forEach(function (element, i) {
            element.forEach(function (item, j) {
                vidx.push({ "value" : item, "i" : i, "j" : j });
            })
        })
        vidx.sort(function (a, b) {
            return b.value - a.value;
		})
		idx = vidx[Math.floor(Math.random() * count)];
        return idx;
    }
    var max_val = -10000000, maxi, maxj, i, j;
    mdt.forEach(function(element, i) {
        element.forEach(function(item, j) {
            if (max_val < item)
            {
                max_val = item;
                maxi = i;
                maxj = j;
            }
        })
	})
    return { "value" : max_val, "i" : maxi, "j" : maxj };
}

function distanceTransform()
{
    var i, j;
    for(i = 0; i < size.height; i ++)
        for(j = 0; j < size.width; j++) {
            if (mask[i][j] == 1)
                mdt[i][j] = 0;
            else
                mdt[i][j] = INF;
        }

	dtFunc();
	mdt.forEach(element => {
		element.forEach(item => item = Math.sqrt(item))
	})
}

function selectionPolygonFill(points, level)
{
    temp_mask = [];
    for(i=0; i < size.height; i++) {
        temp_mask[i] = [];
        for(j=0; j < size.width; j++) {
            if (level == 0)
                temp_mask[i][j] = 1;
            else
            	temp_mask[i][j] = 0;
        }
    }

    var i, j, x, y;
	var pLocal = new Array(size.width *  size.height);
	pLocal.forEach( element => element = 0 );
    var localBox = {
        "top" : 0,
        "left" : size.width,
        "right" : 0,
        "bottom" : size.height
	};
	var next, start;
	var mn = { "x" : points[0].x, "y" : points[0].y }, mx = { "x" : points[0].x, "y" : points[0].y };
	for (i = 1; i < points.length; i ++)
	{
		if (mn.x > points[i].x)
			mn.x = points[i].x;
		if (mn.y > points[i].y)
			mn.y = points[i].y;
		if (mx.x < points[i].x)
			mx.x = points[i].x;
		if (mx.y < points[i].y)
			mx.y = points[i].y;
	}

	for (i = Math.floor(mn.x); i <= Math.ceil(mx.x); i ++)
		for (j = Math.floor(mn.y); j < Math.ceil(mx.y); j ++)
		{
			if (!(i >= 0 && i < size.width && j >= 0 && j < size.height))
				continue;
			var side;
			var sur = true;
			var pos = {"x" : i, "y" : j};
			side = vecMul(points[points.length - 1], points[0], pos);
			for (var k = 1; k < points.length; k ++)
				sur = sur && (side == vecMul(points[k - 1], points[k], pos));
			if (sur)
				mask[j][i] = level;
		}
}

function fillConvexPoly(points, color)
{
    temp_mask = [];
	selectionPolygonFill(points, 1);
    mask.forEach(function (element, i) {
        element.forEach(function(item, j) {
            if (temp_mask[i][j] == 1)
                mask[i][j] = color;
        })
    })
}

function addRect(r, info)
{
    var pts = [];
    {
		var _angle = r.angle * Math.PI / 180;
		var b = Math.cos(_angle) * 0.5;
		var a = Math.sin(_angle) * 0.5;
		var height = r.size.height;
		var width = r.size.width;
        pts.push({ "x" : r.center.x - a * height - b * width,
            "y" : r.center.y - a * width + b * height});
        pts.push({ "x" : r.center.x + a * height - b * width,
            "y" : r.center.y - a * width - b * height});
        pts.push({ "x" : 2 * r.center.x - pts[0].x,
            "y" : 2 * r.center.y - pts[0].y});
        pts.push({ "x" : 2 * r.center.x - pts[1].x,
            "y" : 2 * r.center.y - pts[1].y});
	}

	fillConvexPoly(pts, 1);
	distanceTransform();
	r["info"] = info;
    m_regions.push(r);
}

function addMain(r, info)
{
    addRect(r, info);
}

function addBest(aspect_ratio, info)
{
    var res = searchPosition();
	res.value = Math.sqrt(res.value);
	res.value *= 1.0;
	var rlimsize = Math.min(res.value, limit);
		
    var r = {};
    if (aspect_ratio > 1)
    {
        r["size"] = { "width" : rlimsize, "height" : rlimsize / aspect_ratio };
    }
    else
    {
        r["size"] = { "width" : rlimsize * aspect_ratio, "height" : rlimsize };
    }
    r["center"] = { "x" : res.j, "y" : res.i };
    r.angle = (Math.random() - 0.5) * 60;
    r["lim"] = rlimsize;
    addRect(r, info);
}

function calcImagePos(ptArray)
{
    size = { "width" : 300, "height" : 200 };
	var mainRect = {};
	{
		mainRect.center = { "x" : size.width * 0.5, "y" : size.height * 0.5 };
        mainRect.angle = (Math.random() - 0.5) * 40;
        
        var aspect_ratio = ptArray[0].size.width / ptArray[0].size.height;
        if (aspect_ratio > 1)
            mainRect.size = { "width" : size.width * Math.sqrt(1/ptArray.length), "height" : size.width * Math.sqrt(1/ptArray.length) / aspect_ratio };
        else
            mainRect.size = { "width" : size.height * Math.sqrt(1/ptArray.length) * aspect_ratio, "height" : size.height * Math.sqrt(1/ptArray.length) };
	}

    limit = Math.max(mainRect.size.width, mainRect.size.height) * 1.2;
    initWork();
	addMain(mainRect, ptArray[0]);

    // generate locations of small images
    for (var i = 1; i < ptArray.length; i ++)
    {
        var aspect_ratio = ptArray[i].size.width / ptArray[i].size.height;
        addBest(aspect_ratio, ptArray[i]);
	}
    for (var i = 1; i < ptArray.length; i ++)
    {
        addBest(1, {});
    }
    
    calcDrawers();
	return m_regions;
}

function imageSize(src)
{
    var size = { "width" : 0, "height" : 0};
    var myImage = new Image();
    myImage.onload = function() {
        size = { "width" : this.width, "height": this.height };
        innArr.forEach (element => {
            if (element.image == src)
                element.size = size;
        })
    };
    myImage.onerror = function() {
        size = { "width" : -1, "height": -1 };
        innArr.forEach (element => function () {
            if (element.image == src)
                element.size = size;
        })
    }
    myImage.src = src;
    delete myImage;
    return size;
}
