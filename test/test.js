var dataset = [382, 40, 25, 31, 22, 9, 6, 11, 30, 22];
// var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
//                           11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

var w = window.innerWidth-100;
var h = 500;
var barPadding = 10;
var color = d3.scale.category10();
var down=50;
var margin = {top: 20, right: 10, bottom: 60, left: 10};

//svg要素の生成
var svg = d3.select("body")
  .append("svg")
  .attr({
    width: w,
    height: h
  });
var graph = svg.append("g")
  .attr({
    class:"graph",
    width:w-margin.left-margin.right,
    height:h-margin.top-margin.bottom,
    transform:"translate("+margin.left+","+margin.top+")"
  })

graph.selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr({
    id:"id_graph",
    "x": function(d, i) {
      return i * (w / dataset.length);
    },
    "y": function(d) {
      return  d3.select(".graph").attr("height")- d;
    },
    "width": w / dataset.length - barPadding,
    "height": function(d) {
      return d;
    },
    fill: function(d) {
      return color(d);
    }
  });

graph.selectAll("text")
  .data(dataset)
  .enter()
  .append("text")
  .text(function(d) {
    return d;
  })
  .attr({
    x: function(d, i) {
      return i * (w / dataset.length);
    },
    y: function(d) {
      return d3.select(".graph").attr("height") - (d + 10);
    }
  });


var xScale = d3.scale.linear()
  .domain([0, dataset.length])
  .range([0, w]);
var yScale = d3.scale.linear()
  .domain([0, d3.max(dataset, function(d) {
    return d[1];
  })])
  .range([0, h]);

svg.append("g")
  .attr({
    class:"axis",
    transform:"translate(0,"+(h-30)+")"
  })
  .call(d3.svg.axis()
    .scale(xScale)
    .orient("bottom"));
