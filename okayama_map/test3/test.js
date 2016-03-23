var margin = {
    top: 10,
    right: 40,
    bottom: 100,
    left: 40
  },
  margin2 = {
    top: 430,
    right: 40,
    bottom: 20,
    left: 40
  },
  width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom - 100,
  height2 = window.innerHeight - margin2.top - margin2.bottom - 100;

var dkeys;

var xScale = d3.scale.linear()
  .range([0, width]);
var yScale = d3.scale.linear()
  .range([height, 0]);
var yScale2 = d3.scale.linear()
  .range([height2, 0]);

// var brush = d3.svg.brush()
//   .x(x2)
//   .on("brush", brushed);

var area = d3.svg.area()
  .interpolate("monotone")
  .x(function(d, i) {
    return xScale(i);
  })
  .y0(height)
  .y1(function(d) {
    return yScale(d[dkeys[0]]);
  });

var area2 = d3.svg.area()
  .interpolate("monotone")
  .x(function(d, i) {
    return xScale(i);
  })
  .y0(height2)
  .y1(function(d) {
    return yScale(d[dkeys[0]]);
  });

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);

var focus = svg.append("g")
  .attr("class", "focus")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
  .attr("class", "context")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("test2.csv",type,function(error,data){
  dkeys=d3.map(data[0]).keys();
  var fkey=dkeys.shift();
  var klen=dkeys.length;
  var dlen=data.length;
  xScale.domain([0,dlen-1]);
  var array=data.map(function(d){return d[dkeys[0]];});
  console.log(array)
  context.append("rect")
    .data(array)
    .attr({
      class:"area",
      x:function(d,i){return xScale(i);},
      y:function(d){return 10;},
      width:200,
      height:function(d){return yScale(d);}
    })

});

function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 0; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  return d;
}
