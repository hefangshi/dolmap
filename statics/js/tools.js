$(document).ready(function(){
    var nowPosition=null;
    var me=this;
    function _initMap(){
        $("#map").height($(window).height());
        var tileLayer = new BMap.TileLayer();
        tileLayer.getTilesUrl = function(tileCoord, zoom) {
            var x = tileCoord.x;
            var y = tileCoord.y;
            var maxX=Math.pow(2,zoom-MyMap.getMinZoom());
            var minX=-maxX;
            var warp=2*maxX;
            while(x>=maxX)
            x-=warp;
            while(x<minX)
            x+=warp;
            return 'tiles/' + zoom + '/tile' + x + '_' + y + '.png';
        };
        var MyMap = new BMap.MapType('MyMap', tileLayer, {minZoom: 5, maxZoom: 8});
        var map = new BMap.Map('map', {mapType: MyMap,enableAutoResize:true});
        map.addControl(new BMap.NavigationControl({showZoomInfo:false}));
        map.centerAndZoom(new BMap.Point(24, 0.4), 7);
        map.enableScrollWheelZoom();
        map.enableInertialDragging();
        map.setDefaultCursor('crosshair');
        map.addEventListener('click',function(evt){
            $("#poiInfo").html("选取：x:"+evt.point.lng+" y:"+evt.point.lat);
            me.nowPosition=evt.point;
            $("#citySearch").val('').focus();
        })
        return map;
    }

    function _initControl(){
        var _cache={};
        $('#citySearch').typeahead({
            source:function(query,process){
                $.get('/api/search.php',{kw:query},function(values){
                    var list=[];
                    _cache={};
                    $(values).each(function(index,data){
                        list.push(data.city_name);
                        _cache[data.city_name]=data;
                    });
                    process(list);
                })
            },
            matcher:function(){
                return true;
            }
        }).change(function(){
            var data=_cache[$("#citySearch").val()];
            if (!data)
                $("#nowpoiInfo").html("");
            else
                $("#nowpoiInfo").html("当前：x:"+data.x+" y:"+data.y);
        }).keyup(function(evt){
            if (evt.keyCode==13)
                $('#submit').click();
        })
        $('#submit').click(function(){
            $.post('/api/update.php',{
                city:$("#citySearch").val(),
                point:'{"x":'+me.nowPosition.lng+',"y":'+me.nowPosition.lat+'}'},function(data){
                    $("#nowpoiInfo").html("当前：x:"+me.nowPosition.lng+" y:"+me.nowPosition.lat);
                    $("#info").html($("#citySearch").val()+"提交成功！");
                });
        });
        $("#refresh").click(function(){
            $.get('api/list.php',function(results){
                map.clearOverlays();
                $(results).each(function(index,poi){
                    var marker = new BMap.Marker(new BMap.Point(poi.x, poi.y));
                    var label=new BMap.Label(poi.city_name);
                    marker.setLabel(label);
                    map.addOverlay(marker);                    
                })

            })
        });
        $("#clear").click(function(){
            map.clearOverlays();
        });
    }

    _initControl();
    var map=_initMap();
});