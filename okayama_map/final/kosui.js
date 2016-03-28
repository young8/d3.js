var margin = {
  top: 30,
  right: 50,
  bottom: 230,
  left: 50
};
var w = 1300;
// var w = window.parent.screen.width;
// var h = window.parent.screen.height;
var h = 1000;
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

// var svg2 = d3.select("body").append("svg")
//   .attr("width", width / 2)
//   .attr("height", height)
//   .append("h")
//   .attr("transform", "translate(1000,1000)");
// //.attr("transform","translate("+(margin.left+(width/2))+","+margin.top+")");

var mercator = d3.geo.mercator()
.center([133.837613,34.94759])
// .translate([(w - rightpadding)*0.3, h*0.68])
.translate([width/2, height/2-100])
.scale(30000);

// geojsonからpath要素を作るための設定。
var geopath = d3.geo.path()
.projection(mercator);

var disaster = [];
var place = [];
var fact = [];
d3.csv("saigai.csv", function(error, data) {
  if (error) throw error;
  disaster = data.map(function(d) {
    return d.disaster;
  });
  place = data.map(function(d) {
    return d.place;
  });
  fact = data.map(function(d) {
    return d.fact;
  });
});

var rscale = d3.scale.linear()
.domain([0,400])
.range([5,100])

function update(data, text, dtime) {
  svg.selectAll(".circle")
  .data(data)
  .transition()
  .duration(dtime)
  .attr("r", function(d) {
    // var r = (d * 2) + 5;
    // if(r > 100)return 100;
    var r = rscale(d);
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
      return "場所："+place[start]
    }
  })
  svg.selectAll(".fact")
  .text(function(){
    if(fact[start] != ""){
      return "原因："+fact[start]
    }
  })

  d3.selectAll(".ldata")
  .text(function(d,i){
    return data[i] + "mm";
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
      return rscale(d);
    })
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("stroke", function(d, i) {
      return color(i);
    })
    .attr("fill-opacity","0.5");

    svg.append("g").selectAll("circle")
    .data(array)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", function(d, i) {
      return positions[i][0];
    })
    .attr("cy", function(d, i) {
      //return i * 100
      return positions[i][1];
    })
    .attr("r", function(d) {
      return 5;
    })
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("fill-opacity","0.8");

    var legendg = svg.append("g")
    .attr({
      class:"legend",
      transform:"translate(700,200)"
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

    legendg.append("g").selectAll("text")
    .data(city)
    .enter()
    .append("text")
    .attr("class","ldata")
    .attr("x",140)
    .attr("y",function(d, i) {
      //return i * 100
      return i*25;
    })
    .attr("dy",5)
    .attr("text-anchor","end")
    .style("font-family","メイリオ")
    .style("font-weight","bold")


    //日付
    svg.append("text")
    .attr("x", 100)
    .attr("y", 20)
    .attr("font-size", "50px")
    .attr("class", "date")
    .text(dkeys[0])
    .style("font-family","Century Gothic")

    svg.append("rect")
    .attr({
      x:380,
      y:-20,
      width:550,
      height:120,
      rx:20,
      ry:20,
      fill:"rgba(255,0,0,0.1)",
      stroke:"red",

    })


    //災害情報
    svg.append("text")
    .attr({
      x: 400,
      y: 10,
      "font-size": "25px",
      fill: "black",
    })
    .style("font-family","メイリオ")
    .style("font-weight","bold")
    .text("災害発生情報")

    svg.append("text")
    .attr({
      x: 400,
      y: 40,
      "font-size": "23px",
      fill: "red",
      class: "disaster"
    })
    .style("font-family","メイリオ")
    .style("font-weight","bold")
    svg.append("text")
    .attr({
      x: 400,
      y: 70,
      "font-size": "20px",
      fill: "red",
      class: "place"
    })
    .style("font-style","italic")
    svg.append("text")
    .attr({
      x: 400,
      y: 95,
      "font-size": "20px",
      fill: "red",
      class: "fact"
    })
    .style("font-style","italic")
    //再生停止ボタン
    var contg = svg.append("g")
    .attr({
      class:"control",
      transform:"translate(200,80)"
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


    contg.append("text")
    .attr({
      x:-90,
      y:30,
      "font-size":30
    })
    .text("before")
    .style("cursor","pointer")
    .on("click",function(){
      start=start-2;
      playonce()
    })
    contg.append("text")
    .attr({
      x:60,
      y:30,
      "font-size":30
    })
    .text("next")
    .style("cursor","pointer")
    .on("click",function(){

      playonce()
    })
    // contg.append("text")
    // .attr({
    //   x: 0,
    //   y: 40,
    //   class: "psbutton",
    //   id: "bt",
    //   "text-anchor": "top",
    //   "font-size": 50
    // })
    // .style("cursor", "pointer")
    // .text("再生")
    // .append("button");

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

    var playonce = function() {
      time_id = null;
      //var i = start;
      var array, max, dtime;
      array = data.map(function(d) {
        return d[dkeys[start]];
      });
      update(array, dkeys[start], 500);
      start++;
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
        .attr("fill","none");
        // d3.select("#bt").text("再生")
        clearTimeout(time_id);
      } else {
        d3.select("#br").attr({
          val: "play",
          fill: "red"
        });
        d3.select("#play")
        .attr("fill","none");
        d3.selectAll(".stop")
        .attr("fill","white");
        // d3.select("#bt").text("停止")
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
