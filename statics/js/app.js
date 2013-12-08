var App=App||{};
$(document).ready(function(){
    var nowPosition=null;
    var me=this;
    var marker=null;


    var TypeHeadItem=function(item,value){
        this.item=item;
        this.value=value;
        this.length=this.value.length;
    };

    TypeHeadItem.prototype={
        toString: function() {
            return this.value;
        },
        toLowerCase:function(){
            return String.prototype.toLowerCase.apply(this.value);
        },
        indexOf:function(value){
            return String.prototype.indexOf.apply(this.value,arguments);
        },
        replace:function(){
            return String.prototype.replace.apply(this.value,arguments);
        }
    };

    function showRadiation(start){
        map.clearOverlays();
        $.get('api/radiation.php',{city:start},function(data){
            drawRadiation(data.start,data.routes);
        },'json');
        function drawRadiation(start,routes){
            var startPt=new BMap.Point(start.x,start.y);
            var min=5000;
            var max=0;
            var total=0;
            for (var i = 0; i < routes.length; i++) {
                var r=routes[i];
                var count=parseInt(r.count,10);
                if (count<min){
                    min=count;
                }
                if (count>max){
                    max=count;
                }
                total+=count;
            }
            var label=new BMap.Label('任务数:'+total+" 线路数:"+routes.length,{
                position:startPt
            });
            map.addOverlay(label);
            for (var j = 0; j < routes.length; j++) {
                var route=routes[j];
                var endPt=new BMap.Point(route.x,route.y);
                var color=RGBToHex([238,199-(route.count-min)/(max-min+1)*199,16]);
                var polyline=new BMap.Polyline([startPt,endPt],{
                    strokeColor:color,
                    strokeWeight:'4',
                    strokeOpacity:'0.8'
                });
                map.addOverlay(polyline);
                (function(route){
                    polyline.addEventListener('click',function(){
                        showQuestQuery(start.city_name,route.route);
                    });
                })(route);
            }
        }
        function RGBToHex(rgb){
           var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
           for (var j = 0; j < 3; j++) {
                var r = null; var c = rgb[j];
                var hexAr = [];
                while (c > 16) {
                      r = c % 16;
                      c = (c / 16) >> 0;
                      hexAr.push(hex[r]);
                 } hexAr.push(hex[c]);
               hexColor += hexAr.reverse().join('');
            }
            while(hexColor.length<7)
                hexColor+='0';
           return hexColor;
        }
    }
    function showSimilar(questInfo){
        $('#sim-grid-dialog').width(600);
        var id=questInfo.ID;
        var firstStart=questInfo.routes[0].route;
        var dialog=$('#sim-grid-dialog .modal-body');
        var fromStar=dialog.find('.fromStar');
        var toStar=dialog.find('.toStar');
        initSimGrid();
        initStarLimit();
        $("#sim-grid-dialog .startSelect").empty();
        $(".quest-name").html(questInfo.Name);
        $(questInfo.routes).each(function(index,route){
            if (route.route_type==0){
                $("#sim-grid-dialog .startSelect").append("<option>"+route.route+"</option>");
            }
        });
        $("#sim-grid-dialog .startSelect").unbind('change').change(function(){
            var selectStart=$("#sim-grid-dialog .startSelect").val();
            searchSimilar(id,selectStart,fromStar.val(),toStar.val());
            showQuestRoute(selectStart,questInfo.routes);
        });
        showQuestRoute(firstStart,questInfo.routes);
        searchSimilar(id,firstStart,fromStar.val(),toStar.val());
      	$('#sim-grid-dialog').css({'top':0,'left':'auto','right':0}).modal('show');

        function showQuestRoute(start,routes){
            $("#quest-route").empty();
             $(routes).each(function(index,route){
                if (route.route_type!=0 || route.route==start){
                    $("#quest-route").append(createCityLink(route)).append("<span>-></span>");
                }
            });
            $("#quest-route span:last").remove();
            function createCityLink(route){
                return $("<span class='city-link' data-name='"+route.route+"' data-x='"+route.x+"' data-y='"+route.y+"'>"+route.route+"</span>");
            }
        }

        function initStarLimit(){
            var starLimit=dialog.find('.toStar,.fromStar');
            starLimit.empty();
            fillLevelOpt(starLimit,0,10);
            fromStar.val(0);
            toStar.val(10);
            toStar.change(function(){
                var to=parseInt(toStar.val(),10);
                var from=parseInt(fromStar.val(),10);
                if (to<from){
                    from=to;
                }
                fromStar.val(from);
                var selectStart=$("#sim-grid-dialog .startSelect").val();
                searchSimilar(id,selectStart,fromStar.val(),toStar.val());
            });
            fromStar.change(function(){
                var to=parseInt(toStar.val(),10);
                var from=parseInt(fromStar.val(),10);
                if (to<from){
                    to=from;
                }
                toStar.val(to);
                var selectStart=$("#sim-grid-dialog .startSelect").val();
                searchSimilar(id,selectStart,fromStar.val(),toStar.val());
            });
            function fillLevelOpt(select,from,to){
                for (var j = from; j <= to; j++) {
                    select.append("<option>"+j+"</option>");
                }
            }
        }
    }
    var simTotal = 0;
    function searchSimilar(id,start,fromStar,toStar){
        simTotal = 0;
        $('#sim-grid').flexOptions({newp: 1,params: [
            {name:"id",value:id},
            {name:"start",value:start},
            {name:"fromStar",value:fromStar},
            {name:"toStar",value:toStar}]
        }).flexOptions({
           preProcess:function(data){
               simTotal = data.total;
               $(data.rows).each(function(index,data){
                   if (data.cell.append_route.indexOf(start)===0)
                        return true;
                   data.cell.append_route=start+","+data.cell.append_route;
               });
               return data;
           },
           onSubmit:function(){
                if(simTotal)
                    $('#sim-grid').flexOptions({params: [
                            {name:'total',value:simTotal},
                            {name:"id",value:id},
                            {name:"start",value:start},
                            {name:"fromStar",value:fromStar},
                            {name:"toStar",value:toStar}]
                    });
                return true;
           }
        }).flexReload();
    }
    function initSimGrid(){
        var grid=$("#sim-grid");
        if (grid.css('display')!='none')
            return;
        $("#sim-grid").flexigrid({
            url: 'api/simquest.php',
            dataType: 'json',
            colModel : [
                {display: '任务名称', name : 'name', width : 120, sortable : true, align: 'center'},
                {display: '并行代价', name : 'value', width : 60, sortable : true, align: 'left'},
                {display: '任务星级', name : 'star', width : 50, sortable : true, align: 'center'},
                {display: '技能要求', name : 'skills', width : 130, sortable : true, align: 'left'},
                {display: '任务路径', name : 'append_route',width:220, sortable : true, align: 'left'}
            ],
            addTitleToCell:true,
            sortname: "value",
            sortorder: "asc",
            usepager: true,
            useRp: true,
            rp: 15,
            height: 200,
            autoload:false,
            pagestat: '显示 {from} 到 {to} 条任务，共 {total} 条',
            pagetext: '第',
            outof: '页，共',
            findtext: '查找',
            procmsg: '正在获取任务中 ...',
            nomsg: '未找到任务',
            singleSelect:true,
            onDoubleClick:function(row){
                var id=$(row).attr('id').substring(3);
                queryQuestInfo(id);
            },
            onSubmit:function(e){

            }
        });
    }

    function showQuestQuery(start,end){
        $('#quest-grid-dialog').width(600);
        initQuestGrid();
        $("#quest-grid-dialog .citySearch").on('keyup',function(event){
            if (event.keyCode!='13')
                return;
            var startRoute=$("#quest-grid-dialog .startRoute").val();
            var endRoute=$("#quest-grid-dialog .endRoute").val();
            if(startRoute||endRoute)
                searchQuest(startRoute,endRoute);
        }).change(function(){
            var startRoute=$("#quest-grid-dialog .startRoute").val();
            var endRoute=$("#quest-grid-dialog .endRoute").val();
            if(startRoute||endRoute)
                searchQuest(startRoute,endRoute);        
        });
        $('#quest-grid-dialog').css({'top':0,'left':'auto','right':0}).modal('show').on('shown',function(){
            $(".startRoute").focus();
        });
        if (start||end) {
            $("#quest-grid-dialog .startRoute").val(start);
            $("#quest-grid-dialog .endRoute").val(end);
            searchQuest(start,end);
        }
    }
    var questTotal=0;
    function searchQuest(startRoute,endRoute){
        questTotal=0;
        $('#quest-grid').flexOptions({newp: 1,params: [
            {name:"end",value:endRoute},
            {name:"start",value:startRoute}]
        }).flexOptions({
           preProcess:function(data){
               questTotal = data.total;
               return data;
           },
           onSubmit:function(){
                if(questTotal)
                    $('#quest-grid').flexOptions({params: [
                            {name:'total',value:questTotal},
                            {name:"end",value:endRoute},
                            {name:"start",value:startRoute}]
                    });
                return true;
           }
        }).flexReload();
    }
    function initQuestGrid(){
        var grid=$("#quest-grid");
        if (grid.css('display')!='none')
            return;
        $("#quest-grid").flexigrid({
            url: 'api/questSearch.php?method=filterSearch',
            dataType: 'json',
            colModel : [
                {display: '任务名称', name : 'name', width : 120, sortable : true, align: 'center'},
                {display: '任务星级', name : 'star', width : 50, sortable : true, align: 'center'},
                {display: '技能要求', name : 'skills', width : 130, sortable : true, align: 'left'},
                {display: '任务起点', name : 'start',width:100, sortable : true, align: 'left'},
                {display: '任务路径', name : 'append_route',width:220, sortable : true, align: 'left'}
            ],
            addTitleToCell:true,
            sortname: "star",
            sortorder: "desc",
            usepager: true,
            useRp: true,
            rp: 15,
            height: 200,
            autoload:false,
            pagestat: '显示 {from} 到 {to} 条任务，共 {total} 条',
            pagetext: '第',
            outof: '页，共',
            findtext: '查找',
            procmsg: '正在获取任务中 ...',
            nomsg: '未找到任务',
            singleSelect:true,
            onDoubleClick:function(row){
                var id=$(row).attr('id').substring(3);
                queryQuestInfo(id);
            }
        });
    }
    function queryCity(x,y,name){
        locationTo(x,y);
        appendCityInfo(name);
        function appendCityInfo(name){
            var panelID="#"+name;
            if ($(panelID).length!==0){
                $(panelID).collapse('show');
                return;
            }
            var groupPanel=$("<div></div>").addClass('accordion-group');
            var headingPanel=$("<div></div>").addClass('accordion-heading').appendTo(groupPanel);
            var togglePanel=$("<a></a>").addClass('accordion-toggle').attr({
                'data-toggle':'collapse',
                'data-parent':'#cityInfoPanel',
                'href':panelID
            }).html(name).appendTo(headingPanel);
            var bodyPanel=$("<div></div>").addClass('accordion-body collapse').attr('id',name).appendTo(groupPanel);
            var infoPanel=$("<div></div>").addClass('accordion-inner').appendTo(bodyPanel);
            $("<input class='btn btn-primary btn-mini city-route-btn' type='button' value='任务辐射'/>").
            data('city',name).
            appendTo(infoPanel);
            $("<input class='btn btn-mini city-quest-btn' type='button' value='查找任务'/>").
            data('city',name).
            appendTo(infoPanel);
            groupPanel.appendTo('#cityInfoPanel');
            $(panelID).collapse({
              parent: "#cityInfoPanel"
            });
            $(panelID).collapse('show');
        }
        function locationTo(x,y){
            var point=new BMap.Point(x, y);
            var zoom=Math.max(8,map.getZoom());
            map.centerAndZoom(point, zoom);
            if (marker){
                map.removeOverlay(marker);
                marker=null;
            }
            marker = new BMap.Marker(point);
            marker.setOffset(new BMap.Size(5,5));
            map.addOverlay(marker);
            marker.setAnimation(BMAP_ANIMATION_BOUNCE);
            setTimeout(function(){
                marker.setAnimation(null);
            },2000);
        }
    }
    function queryQuestInfo(id) {
        var panelID="#info_panel_"+id;
        if ($(panelID).length!==0){
            $(panelID).collapse('show');
            return;
        }
        $('.friends').hide();
        $.get('/api/questSearch.php',{method:'queryInfo',id:id},function(data){
            var groupPanel=$("<div></div>").addClass('accordion-group');
            var headingPanel=$("<div></div>").addClass('accordion-heading').appendTo(groupPanel);
            var togglePanel=$("<a></a>").addClass('accordion-toggle').attr({
                'data-toggle':'collapse',
                'data-parent':'#questInfoPanel',
                'href':panelID
            }).html(data.Name).appendTo(headingPanel);
            var bodyPanel=$("<div></div>").addClass('accordion-body collapse').attr('id',"info_panel_"+id).appendTo(groupPanel);
            var infoPanel=$("<div></div>").addClass('accordion-inner').appendTo(bodyPanel);
            $("<div class='quest-star'></div>").html("<b>星级：</b>"+data.Star+"★").appendTo(infoPanel);
            var award=$("<div class='quest-award'></div>").
                append("<div><b>奖励：</b>"+data.Exp+"EXP/"+data.Fame+"FAME </div>").
                appendTo(infoPanel);
            if (data.Discovery)
                $("<div class='quest-discvoery'></div>").
                append("<b>发现物：</b>"+data.DiscoveryType+"&nbsp;&nbsp;"+data.DiscoveryLevel+"★&nbsp;&nbsp;"+data.Discovery).appendTo(infoPanel);
            if (data.routes.length>0){
                var fromCitys=$("<div class='quest-accept'></div>").html("<b>接受地点：</b>").appendTo(infoPanel);
                $(data.routes).each(function(index,data){
                    if (data.route_type==0){
                        var cityLink=$("<div><span class='city-link'>"+data.route+"</span></div>").data('data',data);
                        fromCitys.append(cityLink);
                        $('span',cityLink).click(function(evt){
                            var nowData=$(evt.target).parent().data('data');
                            queryCity(nowData.x,nowData.y,nowData.route);
                        });
                    }
                });
            }
            if(data.AwardItem)
                award.append("<div>"+data.AwardItem+"</div>");
            if (data.PreFound)
                $("<div><b>前置发现：</b>"+data.PreFound+"</div>").appendTo(infoPanel);
            var skill=$("<div><b>技能要求：</b></div>").appendTo(infoPanel);
            if (data.skills.length>0){
                $(data.skills).each(function(index,data){
                    skill.append("<span>"+data.skill+" : "+data.level+"&nbsp;&nbsp;</span>");
                });
            }
            if (data.relation.length>0){
                var preQuestPanel=$("<div class='pre-quest'><b>前置：</b></div>");
                var followQuestPanel=$("<div class='follow-quest'><b>后续：</b></div>");
                var preTag=false;
                var followTag=false;
                $(data.relation).each(function(index,data){
                    var questPanel=$("<div><span class='quest-link'>"+data.name+"</span></div>").
                        data('id',data.id);
                    if (data.relation_type==0){
                        preTag=true;
                        preQuestPanel.append(questPanel);
                    }else if(data.relation_type==1){
                        followTag=true;
                        followQuestPanel.append(questPanel);
                    }
                    $('span',questPanel).click(function(evt){
                        queryQuestInfo($(evt.target).parent().data('id'));
                    });
                });
                (preTag&&infoPanel.append(preQuestPanel));
                (followTag&&infoPanel.append(followQuestPanel));
            }
            var content=unescape(data.Content);
            var parsedList={};
            $(data.routes).each(function(index,data){
                if (parsedList[data.route])
                    return true;
                parsedList[data.route]=true;
                //寻找content中的route内容
                var regex = new RegExp("("+data.route + ")","g");
                content=content.replace(regex,"<span class='city-link' data-name='"+data.route+"' data-x='"+data.x+"' data-y='"+data.y+"'>$1</span>");
            });
            var multiRegex = /([2-9|二|三|四|五|六|七|八|２|３|４|５|６|７|８|９])次/g;
            content=content.replace(multiRegex,"<span class='important'>$1</span>次");
            multiRegex = /[×|x](\d)/g;
            content=content.replace(multiRegex,"<span class='important'>$1</span>次");
            var contentDiv=$("<div class='quest-content'></div>").append("<div><b>任务流程：</b></div>").
                append("<div>"+content+"</div>").
                appendTo(infoPanel);
            var lastLink='';
            $(".city-link",contentDiv).each(function(index,link){
                 link=$(link);
                 if (index!==0&&lastLink!=link.text())
                    return false;
                 lastLink=link.text();
                    $(data.routes).each(function(index,data){
                        if (data.route_type==0){
                            if (data.route==link.text()){
                                link.nextAll('br:first').before("<span class='important'>！</span>");
                            }
                        }
                    });
            });

            if (data.routes.length>1 && data.routes[0].route_type==0){
                $("<input class='btn btn-primary btn-mini dig-btn' type='button' value='查找顺路'/>").
                data('questInfo',data).
                prependTo(infoPanel);
            }

            groupPanel.appendTo('#questInfoPanel');
            $(panelID).collapse({
              parent: "#questInfoPanel"
            });
            $(panelID).on('shown',function(){
                (function(data){
                    showRoutesOnMap(data);
                })(data);
            });
            $(panelID).collapse('show');
        });
        function showRoutesOnMap(data){
            var startLine={};
            var firstRoute=true;
            var questLine=[];
            var bounds=[];
            map.clearOverlays();
            for (var i = 0; i < data.routes.length; i++) {
                var route=data.routes[i];
                var point=new BMap.Point(route.x,route.y);
                bounds.push(point)
                if (route.route_type=='0'){
                    startLine[route.route]=[];
                    startLine[route.route].push(point);
                    var marker=new BMap.Marker(point,{
                        offset:new BMap.Size(5,5)
                    });
                    marker.setLabel(new BMap.Label('起点'));
                    map.addOverlay(marker);
                }else if (firstRoute){
                    firstRoute=false;
                    for(var start in startLine){
                        startLine[start].push(point);
                        map.addOverlay(new BMap.Polyline(startLine[start],{
                            strokeColor:'yellow',
                            strokeWeight:'3'
                        }));
                        questLine.push(point);
                    }
                }else{
                   questLine.push(point);
                }
                if (i==data.routes.length-1){
                    var marker=new BMap.Marker(point,{
                        offset:new BMap.Size(5,5)
                    });
                    marker.setLabel(new BMap.Label('终点'));
                    map.addOverlay(marker);
                }
            }
            map.addOverlay(new BMap.Polyline(questLine,{
                strokeColor:'red',
                strokeWeight:'3'
            }));
            map.setViewport(bounds,{
              zoomFactor:-1
            });
        }
    }

    function _initLayout(){
        $(".main").children("div").height($(window).height());
    }

    function _initMap(){
        var tileLayer = new BMap.TileLayer();
        var host=["http://dolmap.gamesir.com/tiles/",'http://www.dahanghai.org/tiles/'];
        //host = host[Math.round(Math.random())];
        host = host[0];
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
            return  host + zoom + '/tile' + x + '_' + y + '.png';
        };
        var MyMap = new BMap.MapType('MyMap', tileLayer, {minZoom: 5, maxZoom: 9});
        var map = new BMap.Map('map', {mapType: MyMap,enableAutoResize:true});
        map.addControl(new BMap.NavigationControl({showZoomInfo:false}));
        map.centerAndZoom(new BMap.Point(24, 0.4), 7);
        map.enableScrollWheelZoom();
        map.enableInertialDragging();
        return map;
    }

    function _initControl(){
        var _cache={};
        var marker=null;
        $('.modal-title').click(function(){
            $(this).parent().parent().find('.modal-body,.modal-footer').toggle();
        });
        $('.quest-search-btn').click(function(){
            showQuestQuery();
        });
        $('.citySearch').typeahead({
            source:function(query,process){
                $.get('/api/search.php',{kw:query},function(values){
                    var list=[];
                    _cache={};
                    $(values).each(function(index,data){
                        list.push(data.city_name);
                        _cache[data.city_name]=data;
                    });
                    process(list);
                });
            },
            matcher:function(){
                return true;
            },
            items:10
        }).change(function(){
            var data=_cache[$(this).val()];
            if (!data)
                return;
            else
                $(this).trigger('selected',data);
        });
        $('#searchPosition .citySearch').on('selected',function(e,data){
            queryCity(data.x,data.y,data.city_name);
        });
        var searchTimer;
        $('#questSearch').typeahead({
            source:function(query,process){
                if (searchTimer)
                    window.clearTimeout(searchTimer);
                searchTimer = window.setTimeout(doSearch,200);
                function doSearch(){
                    $.get('/api/questSearch.php',{method:'queryList',kw:query},function(values){
                        var list=[];
                        $(values).each(function(index,data){
                            var item=new TypeHeadItem(data,data.name);
                            list.push(item);
                        });
                        process(list);
                    });
                }
            },
            matcher:function(){
                return true;
            },
            updater:function(item){
                $("#questSearch").select();
                queryQuestInfo(item.item.id);
                return item.value;
            },
            items:15
        }).focus();
        $(".quest-clear-btn").click(function(){
            $("#questInfoPanel").empty();
            $("#questSearch").val("");
            max_quest_height=0;
        });
        $('.update-info-btn').click(function (e) {
          $('#update-modal').modal('show');
        });
        $('.quest-content .city-link,#quest-route .city-link').live('click',function(e){
            var link=$(e.currentTarget);
            queryCity(link.attr('data-x'),link.attr('data-y'),link.attr('data-name'));
        });
        $('#questInfoPanel .dig-btn').live('click',function(e){
            var btn=$(e.currentTarget);
            var questInfo=btn.data('questInfo');
            showSimilar(questInfo);
        });
        $('#cityInfoPanel .city-quest-btn').live('click',function(e){
            var btn=$(e.currentTarget);
            var cityname=btn.data('city');
            showQuestQuery(cityname);
        });
        $('#cityInfoPanel .city-route-btn').live('click',function(e){
            $(this).toggle(function(){
                var btn=$(this);
                var cityname=btn.data('city');
                showRadiation(cityname);
                btn.val('隐藏辐射');
            },function(){
                map.clearOverlays();
                $(this).val('任务辐射');
            }).trigger('click');
        });
        $(".city-clear-btn").click(function(){
            $("#cityInfoPanel").empty();
        });
    }
    _initLayout();
    _initControl();
    var map=_initMap();
});
