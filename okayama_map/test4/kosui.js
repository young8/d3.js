var margin = {
  top: 30,
  right: 40,
  bottom: 30,
  left: 70
};
var w = window.innerWidth;
//var h = window.parent.screen.height;
var h = window.innerHeight;
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;
var color = d3.scale.category10();
//var rightpadding = 600;
var start = 0;
var vflag = 0;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

function update(data, text, dtime) {
  svg.selectAll(".circle")
    .data(data)
    .transition()
    .duration(dtime)
    .attr("r", function(d) {
      return (d * 2) + 10;
    })
    .attr("fill", function(d, i) {
      return color(i);
    })
  svg.selectAll(".date")
    .text(text)

  svg.selectAll(".disaster")
    .text(disaster[start])
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

    var dkeys = d3.map(data[0]).keys();
    var fkey = dkeys.shift();
    var array = data.map(function(d) {
      return d[dkeys[0]];
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
    //日付
    svg.append("text")
      .attr("x", 20)
      .attr("y", 20)
      .attr("font-size", "20px")
      .attr("class", "date")
      .text(dkeys[0]);
    //災害情報
    svg.append("text")
      .attr({
        x: 100,
        y: 700,
        "font-size": "100px",
        class: "disaster"
      });
    //再生停止ボタン
    svg.append("rect")
      .attr({
        x: 20,
        y: 80,
        width: 100,
        height: 50,
        "class": "psbutton",
        id: "br",
        fill: "green",
        val: "stop",
        opacity: 0.5
      })
      .style("cursor", "pointer")
      .append("button");
    svg.append("text")
      .attr({
        x: 20,
        y: 120,
        class: "psbutton",
        id: "bt",
        "text-anchor": "top",
        "font-size": 50
      })
      .style("cursor", "pointer")
      .text("再生")
      .append("button");

    var klen = dkeys.length;

    //棒グラフ
    // var maxbar = height / 9;
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
    //       class: function(d, i) {
    //         return "rect" + i;
    //       },
    //       id: function(d, i) {
    //         return "recti" + i + "j" + j;
    //       },
    //       x: function(d, i) {
    //         return j * barwidth;
    //       },
    //       y: function(d, i) {
    //         return (i + 1) * maxbar - yScale(d)+150;
    //       },
    //       width: function(d) {
    //         return Math.floor(d / 3) * barwidth;
    //       },
    //       height: function(d) {
    //         return yScale(d);
    //       },
    //       fill: function(d, i) {
    //         return color(i);
    //       },
    //       "transform": "translate(" + (margin.left + (width / 2)) + "," + margin.top + ")"
    //     })
    //     .on("click", function() {
    //       if (vflag === 0) {
    //         var id = d3.select(this).attr("id").split(/i|j/);
    //         vflag = id[1];
    //         svg.selectAll(".rect" + vflag).style("visibility", "hidden");
    //       }
    //     });
    //}

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
        dtime = (Math.max.apply(null, array)) * 2 + 5;
        update(array, dkeys[start], dtime);
        start++;
        if (start < klen - 1) time_id = setTimeout(countup, dtime);
      };
      countup();
    };

    function stop() {
      console.log("check")
      pflag = 1;
      clearTimeout(time_id);
    }


    svg.selectAll(".psbutton")
      .on("click", function stop() {
        var mode = d3.select("#br").attr("val");
        console.log("check")
        if (mode == "play") {
          d3.select("#br").attr({
            val: "stop",
            fill: "green"
          });
          d3.select("#bt").text("再生")
          clearTimeout(time_id);
        } else {
          d3.select("#br").attr({
            val: "play",
            fill: "red"
          });
          d3.select("#bt").text("停止")
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

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.select(".area").attr("d", area);
  focus.select(".x.axis").call(xAxis);
}

function type(d) {
  var dkeys = d3.map(d).keys();
  dkeys.shift();
  var dlen = dkeys.length;
  for (var i = 0; i < dlen; i++) d[dkeys[i]] = +d[dkeys[i]];
  return d;
}

d3.csv("累積降水量t.csv", function(data) {
  var dkeys = d3.map(data[0]).keys();
  dkeys.shift();

  var parseDate = d3.time.format("%Y/%m/%d").parse;
  var dmax = 380;

  //データセット型変換
  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d[dkeys[0]] = parseInt(d[dkeys[0]]);
  });
  var dateExtent = d3.extent(data.map(F('date'))); //dateの最小値・最大値取得
  //var dMax =  d3.max( data.map( F('kasaoka') ) ); //kasaokaの最大値取得
  var wiw = window.innerWidth;
  var wih = window.innerHeight;
  //上位グラフ用、margin, scale, axis設定
  var margin = {
    top: 10,
    right: 50,
    bottom: 100,
    left: wiw / 2
  };
  var width = wiw - margin.left - margin.right;
  var height = wih / 2 - margin.top - margin.bottom;
  var xScale = d3.time.scale()
    .domain(dateExtent)
    .range([0, width]);
  var yScale = d3.scale.linear()
    .domain([0, dmax])
    .range([height, 0]);
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  //下位グラフ用、margin, scale, axis設定
  var margin2 = {
    top: 400,
    right: 50,
    bottom: 20,
    left: wiw / 2
  };
  var height2 = wih / 2 - margin2.top - margin2.bottom;
  var x2Scale = d3.time.scale()
    .domain(xScale.domain())
    .range([0, width]);
  var y2Scale = d3.scale.linear()
    .domain(yScale.domain())
    .range([height2, 0]);
  var xAxis2 = d3.svg.axis().scale(x2Scale).orient("bottom");

  //上位グラフareaオブジェクト
  var area = d3.svg.area()
    .interpolate("monotone")
    .x(F('date', xScale))
    .y0(height)
    .y1(F(dkeys[0], yScale));

  //下位グラフareaオブジェクト
  var area2 = d3.svg.area()
    .interpolate("monotone")
    .x(F('date', x2Scale))
    .y0(height2)
    .y1(F(dkeys[0], y2Scale));

  //ステージ作成
  // var svg = d3.select("body").append("svg")
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", height + width / 2 + margin.top + margin.bottom);

  //フォーカス時の上位グラフの表示位置調整のためにクリップパスを作成
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var focus = svg.append("g") //上位グラフグループ作成
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g") //下位グラフグループ作成
    .attr("transform", "translate(" + margin2.left + "," + (margin2.top + 100) + ")");

  focus.append("path")
    .datum(data)
    .attr("clip-path", "url(#clip)") //クリップパスを適用
    .attr("d", area)
    .attr("fill", "blue")

  focus.append("g") //x目盛軸
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g") //y目盛軸
    .attr("class", "y axis")
    .call(yAxis);


  context.append("path") //下位グラフ
    .datum(data)
    .attr("d", area2)
    .attr("fill", "blue")

  context.append("g") //下位x目盛軸
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);


  /*
   *brushは透明なrectをグループ上設置しマウスイベントを取得する。
   *設置したrect上ではドラッグで範囲選択が可能
   *範囲が選択されている状態でbrush.extent()メソッドを実行するとその範囲のデータ値を返す
   */

  var brush = d3.svg.brush() //brushオブジェクト作成
    .x(x2Scale) //x軸を選択可能範囲に指定
    .on("brush", brushed);

  context.append("g") //brushグループを作成
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", -6)
    .attr("height", height2 + 7)
    .attr("fill", "green")
    .attr("opacity", 0.2)


  function brushed() {
    console.log(brush.extent());
    xScale.domain(brush.empty() ? x2Scale.domain() : brush.extent()); //選択されたデータセットの範囲をxScaleのdomainに反映
    focus.select("path").attr("d", area); //上位グラフアップデート
    focus.select(".x.axis").call(xAxis); //上位x軸アップデート
  }

});


function D(params) {
  return function(d, i) {
    if (typeof params === 'function') {
      return params(d)
    } else if (typeof params === 'string') {
      return (new Function('return (' + d + params + ')')())
    } else {
      return d
    };
  }
}

function I(params) {
  return function(d, i) {
    if (typeof params === 'function') {
      return params(i)
    } else if (typeof params === 'string') {
      return (new Function('return (' + i + params + ')')())
    } else {
      return i
    };
  }
}

function F(name) {
  var params = Array.prototype.slice.call(arguments, 1);
  return function(d) {
    if (typeof params[0] === 'function') {
      return params[0](d[name])
    } else if (typeof params[0] === 'string') {
      return (new Function('return (' + d[name] + params[0] + ')')())
    } else if (typeof name === 'object') {
      return name
    } else {
      return d[name]
    };
  }
}
