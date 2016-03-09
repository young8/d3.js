var ButtonArea=1000;
var margin = {
    top: 30,
    right: 40,
    bottom: 30+ButtonArea,
    left: 40
  };
var width = window.innerWidth - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom + ButtonArea;

var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  //.ticks(10);

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("docnum.csv", type, function(error, data) {
  if (error) throw error;
  var dkeys = d3.map(data[0]).keys();
  dkeys.shift();
  x.domain(data.map(function(d) {
    return d.city;
  }));
  y.domain([0, d3.max(data, function(d) {
    return d[dkeys[0]];
  })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  //Y軸
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", -7)
    //.attr("dy", ".100em")
    .style("text-anchor", "top")
    .style("font-size", "small")
    .style("font-weight", "bold")
    .text("人数");

  //グラフ上部のテキスト
  svg.append("g")
    .attr("class", "title")
    .append("text")
    .attr({
      id:"title",
      x: width / 2,
      "font-size": "20px",
      "font-weight": "bold",
      "text-anchor":"middle"
    })
    //.style("text-anchor","top")
    .text(dkeys[0])

  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x(d.city);
    })
    .attr("width", x.rangeBand())
    .attr("y", function(d) {
      return y(d[dkeys[0]]);
    })
    .attr("height", function(d) {
      return height - y(d[dkeys[0]]);
    });

    //グラフ下部のテキスト
    var NumPerRow=Math.floor(width/175);
    //var NumPerRow=3
  svg.selectAll(".text")
    .data(dkeys)
    .enter().append("text")
    .attr("class", "text")
    .attr("x", function(d, i) {
      //return i * width / dkeys.length;
      return (i%NumPerRow) * width / NumPerRow;
    })
    //.attr("y", 500)
    .attr("y",function(d,i){
      return Math.floor(i/NumPerRow)*40+500
    })
    .text(function(d) {
      return d;
    })
    .on("click", function(d) {
      var next = d;
      y.domain([0, d3.max(data, function(d) {
        return d[next];
      })]);
      yAxis.scale(y);
      svg.select(".y.axis")
        .transition()
        .duration(1000)
        .call(yAxis)
      svg.select("#title")
        .data(dkeys)
        .transition()
        .text(d)
      svg.selectAll("rect")
        .data(data)
        .call(yAxis)
        .transition()
        .attr("y", function(d) {
          return y(d[next]);
        })
        .attr("height", function(d) {
          return height - y(d[next]);
        })
    })
});

function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 0; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  // d.val1 = +d.val1;
  // d.val2 = +d.val2;
  // d.val3 = +d.val3;
  // d.val4 = +d.val4;
  // d.val5 = +d.val5;
  // d.val6 = +d.val6;
  return d;
}
