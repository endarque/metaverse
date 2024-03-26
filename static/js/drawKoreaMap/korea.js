$(document).ready(function(){
    //0:korea, 1:sido
    drawMap('#korea_map',350, 350, 3000, -6520, 2190, 0);
    /*
    $(".cbp-item").hover3d({
        selector: ".cbp-item-wrapper"
    });
    */
});

//지도 그리기
function drawMap(target, w, h, init_s, initX, initY, type) {
    var width = w; //지도의 넓이
    var height = h; //지도의 높이
    var initialScale = init_s; //확대시킬 값
    var initialX = initX; //초기 위치값 X
    var initialY = initY; //초기 위치값 Y
    var labels;

    var projection = d3.geo
        .mercator()
        .scale(initialScale)
        .translate([initialX, initialY]);

    var path = d3.geo.path().projection(projection);

    var zoom = d3.behavior
        .zoom()
        .translate(projection.translate())
        .scale(projection.scale())
        .scaleExtent([height, 800 * height])
        .on('zoom', zoom);


    var svg = d3
        .select(target)
        .append('svg')
        .attr('width', width + 'px')
        .attr('height', height + 'px')
        .attr('id', 'map')
        .attr('class', 'map');

    var states = svg
        .append('g')
        .attr('id', 'states')
        //.call(zoom);

    states
        .append('rect')
        .attr('class', 'background')
        .attr('width', width + 'px')
        .attr('height', height + 'px')


    //geoJson데이터를 파싱하여 지도그리기
    d3.json('static/json/korea.json', function(json) {
        states
            .selectAll('path') //지역 설정
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', function(d) {
                return 'path-' + d.properties.name_eng;
            })
            .on("click", clicked);
/*
        for (var j = 0; j < json.features.length; j++) {

            var jsonState = json.features[j].properties.name_eng;

            if (jsonState == 'Seoul') {

                //Copy the data value into the JSON

                states.selectAll('path')
                    .data(json.features[j])
                    .enter()
                    .attr('onclick',clicked);

                //Stop looking through the JSON
                break;
            }
        }

        labels = states
            .selectAll('text')
            .data(json.features) //라벨표시
            .enter()
            .append('text')
            .attr('transform', translateTolabel)
            .attr('id', function(d) {
                return 'label-' + d.properties.name_eng;
            })
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .text(function(d) {
                return d.properties.name;
            });
*/
    });


    //텍스트 위치 조절 - 하드코딩으로 위치 조절을 했습니다.
    function translateTolabel(d) {
        var arr = path.centroid(d);
        if (d.properties.code == 31) {
            //서울 경기도 이름 겹쳐서 경기도 내리기
            arr[1] +=
                d3.event && d3.event.scale
                    ? d3.event.scale / height + 20
                    : initialScale / height + 20;
        } else if (d.properties.code == 34) {
            //충남은 조금 더 내리기
            arr[1] +=
                d3.event && d3.event.scale
                    ? d3.event.scale / height + 10
                    : initialScale / height + 10;
        }
        return 'translate(' + arr + ')';
    }

    function zoom() {
        projection.translate(d3.event.translate).scale(d3.event.scale);
        states.selectAll('path').attr('d', path);
        labels.attr('transform', translateTolabel);
    }
    function clicked(d) {
        //console.log(d.properties.name_eng);
        d3.selectAll('path').style("fill", "#0f1724");
        d3.selectAll('path:hover').style("fill", "#fdd058");
        d3.select(this).style("fill", "white");

        var insert = document.getElementById("area_name");
        insert.innerHTML = d.properties.name_eng;

        var city = document.getElementById("city_img");
        city_name = "city_"+d.properties.name_eng;
        city.src = "static/metaverse/asset/map/city/"+city_name+"/"+city_name+".png";


    }
}
