<?php
    require_once("../includes/conn.php");
    header('Content-type: application/json');

    $city=$_GET['city'];
    $conn=Conn::GetConn();

    $query="insert logs set type='radiation_search',content='city:" . $city . "',ip='" . get_onlineip() . "'";
    //mysql_query($query,$conn);

    $city=mysql_real_escape_string($city);
    $query = "SELECT b.route,c.x,c.y,count(b.quest_id) as count FROM `quest_routes` a
        left join `quest_routes` b
        on a.quest_id=b.quest_id
        left join `dol_city` c
        on c.city_name=b.route
        WHERE a.route='". $city ."' and a.route_type=0
        and b.route_type=1
        and b.route_index=(select max(route_index) from quest_routes where quest_id=a.quest_id and route_type=1)
        group by b.route";
    $result=mysql_query($query,$conn);
    $return['routes']=array();
    while($row=mysql_fetch_object($result))
    {   
        array_push($return['routes'],$row);
    }
    $query = "SELECT * FROM dol_city WHERE city_name ='" . $city . "'";
    $result=mysql_query($query,$conn);
    if($start=mysql_fetch_object($result))
    {   
        $return['start']=$start;
    }
    echo json_encode($return);

    function  get_onlineip() {  
            $onlineip = '';  
            if(getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown')) {  
                $onlineip = getenv('HTTP_CLIENT_IP');  
            } elseif(getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')) {  
                $onlineip = getenv('HTTP_X_FORWARDED_FOR');  
            } elseif(getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')) {  
                $onlineip = getenv('REMOTE_ADDR');  
            } elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], 'unknown')) {  
                $onlineip = $_SERVER['REMOTE_ADDR'];  
            }  
            return $onlineip;  
    } 
?>
