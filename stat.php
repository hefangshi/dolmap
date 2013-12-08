<?php
require_once("includes/conn.php");
$query = "SELECT COUNT( * ) count , DATE_FORMAT( TIME,  '%Y-%m-%d' ) day
    FROM  `logs` 
    GROUP BY DATE_FORMAT( TIME,  '%Y-%m-%d' ) 
    ORDER BY TIME ASC";
$conn=Conn::GetConn();
$result=mysql_query($query,$conn);
$rowcount=0;
while($row=mysql_fetch_object($result))
{   
    $day=$row->day;
    $count=$row->count;
    if($rowcount==0)
        $start=$day;
    $end=$day;
    $data[$rowcount]=(int)$count;
    $rowcount++;
}

?>

<html>
<head>
    <title>请求量统计</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script type="text/javascript" src="statics/js/jquery-1.8.2.min.js"></script>
    <script type="text/javascript" src="statics/js/highcharts.js"></script>
</head>
<body>
    <div id="container"></div>
    <script type="text/javascript">
    $(function () {
        var chart;
        var pointStart=<?php echo "new Date('$start').getTime()" ?>;
        var data=<?php echo json_encode($data) ?>;
        $(document).ready(function() {
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'container',
                    zoomType: 'x',
                    spacingRight: 20
                },
                title: {
                    text: '请求量统计'
                },
                subtitle: {
                    text: document.ontouchstart === undefined ?
                    '拉选范围放大数据' :
                    '拉选范围放大数据'
                },
                xAxis: {
                    type: 'datetime',
                    maxZoom: 14 * 24 * 3600000, // fourteen days
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    title: {
                        text: '请求量'
                    },
                    showFirstLabel: false
                },
                tooltip: {
                    shared: true,
                    xDateFormat: '%Y-%m-%d'
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                            stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, 'rgba(2,0,0,0)']
                            ]
                        },
                        lineWidth: 1,
                        marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    radius: 5
                                }
                            }
                        },
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null
                    }
                },

                series: [{
                    type: 'area',
                    name: '请求量',
                    pointInterval: 24 * 3600 * 1000,
                    pointStart: pointStart,
                    data: data
                }]
            });
});

});

</script>
</body>
</html>