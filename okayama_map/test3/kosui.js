//////////////////////
var margin = {
    top: 10,
    right: 40,
    bottom: 100,
    left: 40
  },
  margin2 = {
    top: 330,
    right: 40,
    bottom: 20,
    left: 40
  },
  width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom-100,
  height2 = window.innerHeight - margin2.top - margin2.bottom-100;

//var parseDate = d3.time.format("%Y/%m/%d").parse;

var x = d3.time.scale().range([0, width]),
  x2 = d3.time.scale().range([0, width]),
  y = d3.scale.linear().range([height, 0]),
  y2 = d3.scale.linear().range([height2, 0]);

var xScale=d3.scale.linear()
    .range([0,width])

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
  xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
  yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
  .x(x2)
  .on("brush", brushed);

var area = d3.svg.area()
  .interpolate("monotone")
  .x(function(d) {
    return x(d.date);
  })
  .y0(height)
  .y1(function(d) {
    return y(d.kasaoka);
  });

var area2 = d3.svg.area()
  .interpolate("monotone")
  .x(function(d) {
    return x2(d.date);
  })
  .y0(height2)
  .y1(function(d) {
    return y2(d.kasaoka);
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

d3.csv("test2.csv", type, function(error, data) {
  var dkeys = d3.map(data[0]).keys();
  var fkey=dkeys.shift();
  var dlen=dkeys.length;
  xScale.domain([0,dlen-1]);
  x.domain(d3.extent(data.map(function(d) {
    return d.date[0];
  })));
  y.domain([0, d3.max(data.map(function(d) {
    return d[dkeys[0]];
  }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  // focus.append("path")
  //   .data(data)
  //   .attr("class", "area")
  //   .attr("d", area);

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // context.append("path")
  //   .data(data)
  //   .attr("class", "area")
  //   .attr("d", area2);

  context.append("rect")
    .data(data)
    .attr({
      class:"area",
      x:function(d,i){return xScale(i);},
      y:3
    });

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr({
      y: -6,
      height: height2 + 7,
      fill: "green",
      opacity: 0.2
    })
});

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.select(".area").attr("d", area);
  focus.select(".x.axis").call(xAxis);
}

// function type(d) {
//   //d.date = parseDate(d.date);
//   d.date = d.date.split("/");
//   d.kasaoka = +d.kasaoka;
//   return d;
// }
function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 1; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  d.date=d.date.split("/");
  return d;
}

// function range(d){
//   var dkeys=d3.map(d).keys();
//   dkeys.shift();
//   var s=dkeys.shift();
//   var f=dkeys.pop();
//   xScale.domain([s,f]);
// }
