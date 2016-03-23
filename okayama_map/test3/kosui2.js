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
  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + width / 2 + margin.top + margin.bottom);

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
