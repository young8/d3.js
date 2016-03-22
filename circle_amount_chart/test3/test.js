//var dataset = [10, 20, 15];

var margin = {
  top: 30,
  right: 40,
  bottom: 30,
  left: 70
};
var w = window.innerWidth;
var h = 1000;
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;
var color = d3.scale.category10();

var svg = d3.select("body").append("svg")
  .attr("width", w)
  .attr("height", h)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function circles(data, name, cx, cy, r) {
  svg.selectAll(name)
    .data(d3.range(data))
    .enter()
    .append("circle")
    .attr("cx", function(d, i) {
      return (i % 10 * 50) + cx;
    })
    .attr("cy", function(d, i) {
      return Math.floor(i / 10) * 20 + cy;
    })
    .attr("r", r)
    .attr("fill", function(d) {
      return color(name);
    })
}
//var dlen = dataset.length;

d3.csv("test.csv", type, function(error, data) {
  if (error) throw error;

  //dot chart の出力
  var array = data.map(function(d) {
    return d.val1;
  })
  var alen = array.length;
  for (var i = 0; i < alen; i++) {
    var tmp = array[i];
    var rcount = 0;
    var rsum = 0;
    while (tmp > 0) {
      var tmp2 = Math.floor(tmp / 10);
      var r = rcount * 3 + 5;
      rsum = rsum + r;
      circles(tmp - tmp2 * 10, "circle" + i, 25, i * 100 + rsum * 2 + 20, r);
      tmp = tmp2;
      rcount++;
    }
  }

  svg.selectAll("text")
    .data(data.map(function(d) {
      return d.city;
    }))
    .enter()
    .append("text")
    .attr("x",-margin.left)
    .attr("y", function(d, i) {
      return i * 100+margin.top;
    })
    .text(function(d) {
      return d;
    })

})

function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 0; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  return d;
}
