var margin = {
  top: 30,
  right: 40,
  bottom: 30,
  left: 70
};
var w = 1300;
//var h = window.parent.screen.height;
var h = 900;
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;
var color = d3.scale.category10();
//var rightpadding = 600;
var start = 100;
var vflag = 0;

var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var mercator = d3.geo.mercator()
.center([133.837613,34.94759])
// .translate([(w - rightpadding)*0.3, h*0.68])
.translate([w/2-300, h/2-120])
.scale(30000);

// geojsonからpath要素を作るための設定。
var geopath = d3.geo.path()
.projection(mercator);

var disaster = [];
var place = [];
d3.csv("saigai.csv", function(error, data) {
  if (error) throw error;
  disaster = data.map(function(d) {
    return d.disaster;
  });
  place = data.map(function(d) {
    return d.place;
  });
});

function update(data, text, dtime) {
  svg.selectAll(".circle")
  .data(data)
  .transition()
  .duration(dtime)
  .attr("r", function(d) {
    var r = (d * 2) + 7;
    if(r > 100)return 100;
    return r;
  })
  .attr("fill", function(d, i) {
    return color(i);
  })
  svg.selectAll(".date")
  .text(text)

  svg.selectAll(".disaster")
  .text(function(){
    if(disaster[start] != ""){
      return disaster[start]+"発生"
    }
  })
  svg.selectAll(".place")
  .text(function(){
    if(place[start] != ""){
      return place[start]
    }
  })
}

//後で各地点のデータをプロットするための座標処理
var positions = [];
var city =[];
d3.csv("zahyo.csv", type, function(error, data) {
  if (error) throw error;
  data.forEach(function(d) {
    positions.push(mercator([d.y, d.x]));
  });
  data.forEach(function(d) {
    city.push(d.city);
  });
});

d3.json("map/okayamaken.geojson", function(error, okayama) {
  makegeo(okayama.features);
  d3.csv("ruisekikosui.csv", type, function(error, data) {
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
      return d*2+7;
    })
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("stroke", function(d, i) {
      return color(i);
    })
    .attr("fill-opacity","0.5");

    var legendg = svg.append("g")
    .attr({
      class:"legend",
      transform:"translate(700,100)"
    });

    legendg.selectAll("circle")
    .data(array)
    .enter()
    .append("circle")
    .attr("class", "legengc")
    .attr("cx", 0)
    .attr("cy", function(d, i) {
      //return i * 100
      return i*25;
    })
    .attr("r", function(d) {
      return 10;
    })
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("stroke", function(d, i) {
      return color(i);
    })
    .attr("fill-opacity","0.5");

    legendg.selectAll("text")
    .data(city)
    .enter()
    .append("text")
    .attr("class","legendt")
    .attr("x",13)
    .attr("y",function(d, i) {
      //return i * 100
      return i*25;
    })
    .attr("dy",5)
    .style("font-family","メイリオ")
    .style("font-weight","bold")
    .text(function(d){return d;})

    //日付
    svg.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .attr("font-size", "50px")
    .attr("class", "date")
    .text(dkeys[0])
    .style("font-family","Century Gothic")
    .on("click",function(){
      if(d3.select("#br").attr("val")=="stop"){
        d3.select("#change_date").style("visibility","visible")
      }
    })

    //災害情報
    svg.append("text")
    .attr({
      x: 350,
      y: 20,
      "font-size": "30px",
      fill: "red",
      class: "disaster"
    })
    .style("font-family","メイリオ")
    .style("font-weight","bold")
    svg.append("text")
    .attr({
      x: 350,
      y: 50,
      "font-size": "25px",
      fill: "red",
      class: "place"
    })
    .style("font-style","italic")

    //再生停止ボタン
    var contg = svg.append("g")
    .attr({
      class:"control",
      transform:"translate(20,80)"
    });

    contg.append("circle")
    .attr({
      cx: 25,
      cy: 25,
      r:30,
      "class": "psbutton",
      id: "br",
      fill: "green",
      val: "stop",
      opacity: 0.5
    })
    .style("cursor", "pointer")

    contg.append("rect")
    .attr({
      class: "psbutton stop",
      x:10,
      y:7,
      width:13,
      height:35,
      fill:"none",
      opacity:0.8
    })
    .style("cursor", "pointer")
    contg.append("rect")
    .attr({
      class: "psbutton stop",
      x:27,
      y:7,
      width:13,
      height:35,
      fill:"none",
      opacity:0.8
    })
    .style("cursor", "pointer")

    contg.append("path")
    .attr({
      class: "psbutton",
      id:"play",
      transform:"translate(30,25),rotate(90)",
      "d": d3.svg.symbol().type("triangle-up").size(600),
      fill:"white",
      opacity:0.8
    })
    .style("cursor", "pointer")

    var klen = dkeys.length;

    //棒グラフ
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
    //         return (i + 1) * maxbar - yScale(d);
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
    // }

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
        d3.select("#play")
        .attr("fill","white");
        d3.selectAll(".stop")
        .attr("fill","none")
        clearTimeout(time_id);
      } else {
        d3.select("#br").attr({
          val: "play",
          fill: "red"
        });
        d3.select("#play")
        .attr("fill","none");
        d3.selectAll(".stop")
        .attr("fill","white");;
        if($("#change_date").css("visibility")==="visible"){
          var date=new Date($("#change_date").val())
          var A=new Date('1976/1/1')
          var B=date;
          var diff=B.getTime()-A.getTime();
          var diff_days=Math.floor(diff/(1000*60*60*24));
          if(0<=diff_days&&diff_days<=14609) start=diff_days;
          $("#change_date").val("").css("visibility","hidden");
        }
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
    "fill": function(d){
      if(d.properties["N03_004"]=="倉敷市"||d.properties["N03_004"]=="笠岡市"||d.properties["N03_004"]=="井原市"||d.properties["N03_004"]=="高梁市"||d.properties["N03_004"]=="新見市"||d.properties["N03_004"]=="浅口市"||d.properties["N03_004"]=="早島町"||d.properties["N03_004"]=="里庄町"||d.properties["N03_004"]=="矢掛町"||d.properties["N03_004"]=="総社市"){
        return "darkgray";
      }
      return "lightgray";
    },
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
