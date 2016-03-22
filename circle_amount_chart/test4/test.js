//var dataset = [10, 20, 15];

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


function update(data, name, cx, cy, r) {
  var circles = svg.selectAll("#" + name + "r" + r).data(d3.range(data))

  circles.enter()
    .append("circle")
    .transition()
    .duration(300)
    .each('start',function(){
      d3.select(this).attr({
        r:0,
        fill:"white"
      })
    })
    .attr("class", "circle")
    .attr("id", name + "r" + r)
    .attr("cx", function(d, i) {
      return (i % 10 * 50) + cx;
    })
    .attr("cy", function(d, i) {
      return Math.floor(i / 10) * 20 + cy;
    })
    .attr("r", r)
    .attr("fill", function(d) {
      return color(name);
    });

  circles.exit()
    .transition()
    .duration(300)
    .attr("r", 0)
    .remove();
}
//var dlen = dataset.length;

d3.csv("PopPerDoc.csv", type, function(error, data) {
  if (error) throw error;
  var dkeys = d3.map(data[0]).keys();
  var fkey = dkeys.shift();
  var mDigit;
  var max = d3.max(data, function(d) {
    return d[dkeys[0]];
  });
  for (mDigit = 1; max > 9; mDigit++) max = max / 10;

  //dot chart の出力
  var array = data.map(function(d) {
    return d[dkeys[0]];
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
      update(tmp - tmp2 * 10, "circle" + i, 25, i * 100 + rsum * 2 + 20, r);
      tmp = tmp2;
      rcount++;
    }
  }

  svg.selectAll("#" + fkey)
    .data(data.map(function(d) {
      return d[fkey];
    }))
    .enter()
    .append("text")
    .attr("id", fkey)
    .attr("x", -margin.left)
    .attr("y", function(d, i) {
      return i * 100 + margin.top;
    })
    .text(function(d) {
      return d;
    })

  svg.selectAll(".keys")
    .data(dkeys)
    .enter()
    .append("text")
    .attr("class", "keys")
    .attr("id", "key:" + function(d) {
      return d;
    })
    .attr("x", 500)
    .attr("y", function(d, i) {
      return i * 20 + margin.top;
    })
    .text(function(d) {
      return d;
    })
    .on("click", function(d) {
      var keyname = d;
      var array = data.map(function(d) {
        return d[keyname];
      })
      var alen = array.length;
      for (var i = 0; i < alen; i++) {
        var tmp = array[i];
        var count = 0;
        var rsum = 0;
        while (tmp > 0) {
          var tmp2 = Math.floor(tmp / 10);
          var r = count * 3 + 5;
          rsum = rsum + r;
          update(tmp - tmp2 * 10, "circle" + i, 25, i * 100 + rsum * 2 + 20, r);
          tmp = tmp2;
          count++;
        }
        //removeしきれていないものをとりのぞく
        while (count <= mDigit) {
          svg.selectAll("#circle" + i + "r" + (count * 3 + 5))
            .transition()
            .duration(300)
            .attr("r", 0)
            .remove();
          count++;
        }
      }
      //次の状態遷移のために最大桁数を計算
      max = d3.max(data, function(d) {
        return d[keyname];
      });
      for (mDigit = 1; max > 9; mDigit++) max = max / 10;
    })
})

function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 0; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  return d;
}
