var margin = {
  top: 30,
  right: 40,
  bottom: 30,
  left: 70
};
// var w = window.innerWidth;
// var h = 3500;
var w = window.parent.screen.width;
var h = window.parent.screen.height;
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;
var color = d3.scale.category10();
//var rightpadding = 600;
var start = 200;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var svg2 = d3.select("body").append("svg")
//   .attr("width", width / 2)
//   .attr("height", height)
//   .append("h")
//   .attr("transform", "translate(1000,1000)");
//.attr("transform","translate("+(margin.left+(width/2))+","+margin.top+")");

var mercator = d3.geo.mercator()
  .center([133.746748, 34.543963])
  // .translate([(w - rightpadding)*0.3, h*0.68])
  .translate([w * 0.2, h * 0.68])
  .scale(20 * w);

// geojsonからpath要素を作るための設定。
var geopath = d3.geo.path()
  .projection(mercator);

var disaster;
d3.csv("災害.csv", function(error, data) {
  if (error) throw error;
  disaster = data.map(function(d) {
    return d.disaster;
  });
});

var barnum = 13;
var padding = 5;
var barwidth = ((width / 2) - margin.left - margin.right) / barnum;
var maxbar = height / 8;
var max = 380;
var yScale = d3.scale.linear()
  .domain([0, max])
  .range([0, maxbar]);
var dkeys;

function update(data, date, dtime, data2) {
  console.log(data2)
  svg.selectAll(".circle")
    .data(data)
    .transition()
    .duration(dtime)
    .attr("r", function(d) {
      return (d * 1.2) + 10;
    })
    .attr("fill", function(d, i) {
      return color(i);
    })
  svg.selectAll(".date")
    .text(date)
  svg.selectAll(".disaster")
    .text(disaster[start])

  svg.select("#rect" + (start + 7))
    .data(data2)
    .append("rect")
    .transition()
    .duration(dtime)
    .attr({
      class: "bar",
      id: function(d, i) {
        return "bar" + (start + 7);
      },
      x: function(d, i) {
        return 12 * barwidth;
      },
      y: function(d, i) {
        return (i + 1) * maxbar - yScale(d);
      },
      width: barwidth - padding,
      height: function(d) {
        return yScale(d) + 50;
      },
      fill: function(d, i) {
        return color(i);
      },
      "transform": "translate(" + (width / 2) + "," + margin.top + ")"
    });
  for (var i = start - 5; i < start + 7; i++) {
    svg.selectAll("#bar" + (i))
      .transition()
      .duration(dtime)
      .attr({
        x: function() {
          return d3.select(this).attr("x") - barwidth;
        }
      })
  };
  svg.selectAll("#bar" + (start - 6))
    .transition()
    .duration(dtime)
    .attr({
      width: 0
    })
    .remove();
  console.log("#bar" + (start - 6))
}

//後で各地点のデータをプロットするための座標処理
var positions = [];
d3.csv("zahyo.csv", type, function(error, data) {
  if (error) throw error;
  data.forEach(function(d) {
    positions.push(mercator([d.y, d.x]));
  });
});

d3.json("map/okayamaken.geojson", function(error, okayama) {
  makegeo(okayama.features);
  d3.csv("累積降水量.csv", type, function(error, data) {
    if (error) throw error;
    dkeys = d3.map(data[0]).keys();
    var fkey = dkeys.shift();
    var ckey = dkeys[start];
    var array = data.map(function(d) {
      return d[ckey];
    });
    //サークルの描画
    svg.selectAll("circle")
      .data(array)
      .enter()
      .append("circle")
      .transition()
      .duration(100)
      .attr("class", "circle")
      .attr("cx", function(d, i) {
        return positions[i][0];
      })
      .attr("cy", function(d, i) {
        //return i * 100
        return positions[i][1];
      })
      .attr("r", function(d) {
        return d * 2 + 10;
      })
      .attr("fill", function(d, i) {
        return color(i);
      });
    svg.append("text")
      .attr("x", 20)
      .attr("y", 20)
      .attr("font-size", "20px")
      .attr("class", "date")
      .text(ckey)

    svg.append("text")
      .attr({
        x: 100,
        y: 700,
        "font-size": "100px",
        class: "disaster"
      })

    //var button = svg.append("button");
    svg.append("circle")
      .attr({
        cx: 40,
        cy: 80,
        r: 20,
        "class": "psbutton",
        fill: "green",
        val: "stop",
        opacity: 0.5
      });

    var klen = dkeys.length;

    //棒グラフ
    if (1) {
      // var maxbar = height / 8;
      // var barwidth = ((width / 2) - margin.left - margin.right) / klen;
      // var max = 380;
      // var yScale = d3.scale.linear()
      //   .domain([0, max])
      //   .range([0, maxbar]);
      // for (var j = 0; j < klen - 1; j++) {
      //   var array = data.map(function(d) {
      //     return d[dkeys[j]];
      //   });
      //   svg.selectAll("#rect")
      //     .data(array)
      //     .enter()
      //     .append("rect")
      //     .attr({
      //       class: "rect",
      //       id: "rect" + j,
      //       x: function(d, i) {
      //         return j * barwidth;
      //       },
      //       y: function(d, i) {
      //         return (i + 1) * maxbar - yScale(d);
      //       },
      //       width: barwidth,
      //       height: function(d) {
      //         return yScale(d);
      //       },
      //       fill: function(d, i) {
      //         return color(i);
      //       },
      //       "transform": "translate(" + (margin.left + (width / 2)) + "," + margin.top + ")"
      //     });
      // }

      var s = start - Math.floor(barnum / 2);
      for (var j = 0; j < barnum; j++) {
        var array = data.map(function(d) {
          return d[dkeys[s + j]];
        });
        svg.selectAll(".rect")
          .data(array)
          .enter()
          .append("rect")
          .attr({
            class: "bar",
            id: function(d, i) {
              return "bar" + (s + j);
            },
            x: function(d, i) {
              return j * barwidth;
            },
            y: function(d, i) {
              return (i + 1) * maxbar - yScale(d);
            },
            width: barwidth - padding,
            height: function(d) {
              return yScale(d) + 50;
            },
            fill: function(d, i) {
              return color(i);
            },
            //"transform": "translate(" + (margin.left + (width / 2)) + "," + margin.top + ")"
            "transform": "translate(" + (width / 2) + "," + margin.top + ")"
          });
      }
    }

    //サークルの大きさ変化部
    //var i = 1;
    var max, dtime;
    var time_id = null;
    var tmp = null;
    var pflag = 0;
    var play = function() {
      time_id = null;
      //var i = start;
      var array, max, dtime;
      var countup = function() {
        array = data.map(function(d) {
          return d[dkeys[start]];
        });
        var array2 = data.map(function(d) {
          return d[dkeys[start + 7]]
        })
        dtime = (Math.max.apply(null, array)) * 2 + 5;
        update(array, dkeys[start], dtime, array2);
        start++;
        if (start < klen - 1) time_id = setTimeout(countup, dtime);
      };
      countup();
    };

    function stop() {
      pflag = 1;
      clearTimeout(time_id);
    }


    svg.select(".psbutton")
      .on("click", function stop() {
        var mode = d3.select(this).attr("val");
        if (mode == "play") {
          d3.select(this).attr({
            val: "stop",
            fill: "green"
          });
          clearTimeout(time_id);
        } else {
          d3.select(this).attr({
            val: "play",
            fill: "red"
          })
          play();
        }
      });
    //start = 1;
    //play();
  });
});

function makegeo(geodata) {
  var sflag = [];
  for (var i = 0; i < geodata.length; i++) {
    sflag.push({
      flag: 0
    });
  };

  var map = svg
    .selectAll("puth")
    .data(geodata)
    .enter().append("path")
    .attr({
      "id": function(d, i) {
        return "city" + i;
      },
      "d": geopath,
      "fill": "orange",
      "stroke": "white",
      "stroke-width": 1
    })
}

function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 0; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  return d;
}
