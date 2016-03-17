var margin = {
  top: 30,
  right: 40,
  bottom: 30,
  left: 70
};
var w = window.innerWidth;
var h = 1500;
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;
var color = d3.scale.category10();

var svg = d3.select("body").append("svg")
  .attr("width", w)
  .attr("height", h)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function update(data, text, dtime) {
  console.log(data);
  svg.selectAll(".circle")
    .data(data)
    .transition()
    .duration(dtime)
    .attr("r", function(d) {
      return (d * 2)+10;
    })
    .attr("fill",function(d,i){return color(i);})
  svg.selectAll("text")
    .text(text)
}

d3.csv("累積降水量.csv", type, function(error, data) {
  if (error) throw error;
  var dkeys = d3.map(data[0]).keys();
  var fkey = dkeys.shift();
  var array = data.map(function(d) {
    return d[dkeys[0]];
  });
  svg.selectAll("circle")
    .data(array)
    .enter()
    .append("circle")
    .transition()
    .duration(100)
    .attr("class", "circle")
    .attr("cx", 300)
    .attr("cy", function(d, i) {
      return i * 100
    })
    .attr("r", function(d) {
      return d * 2+10;
    })
    .attr("fill", function(d, i) {
      return color(i);
    });
  svg.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .text(fkey)
  var klen = dkeys.length;
  var i = 1;
  var max,dtime;

  var countup = function() {
    array = data.map(function(d) {
      return d[dkeys[i]];
    });
    dtime = (Math.max.apply(null, array))*2+5;
    update(array, dkeys[i],dtime);
    i++;
    if(i<klen-1)setTimeout(countup,dtime);
  };
  countup();

  // timerID = setInterval(function() {
  //   if (i == klen - 1) {
  //     clearInterval(timerID);
  //     timerID = null;
  //   }
  //   array = data.map(function(d) {
  //     return d[dkeys[i]];
  //   });
  //   max = Math.max.apply(null, array);
  //   update(array, dkeys[i + 1], max);
  //   i++;
  // }, 300)
})

function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 0; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  return d;
}
