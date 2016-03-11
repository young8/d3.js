var test=[10, 20, 15];
var ButtonArea = 1000;
var color = d3.scale.category20();
var margin = {
  top: 30,
  right: 40,
  bottom: 30 + ButtonArea,
  left: 55
};
var width = window.innerWidth - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom + ButtonArea;
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dotline = svg.append("g")
  .attr("id", "dotline")

dotline.selectAll(".circle")
  .data(d3.range(array))
  .enter().append("circle")
  .attr({
    cx: function(d) {
      return d * 13;
    },
    cy: 0,
    r: 5
  })

  var dotlines = function
