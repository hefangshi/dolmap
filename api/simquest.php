<?php
    require_once("../includes/conn.php");
    header('Content-type: application/json');

    $conn=Conn::GetConn();
    $page=$_POST['page'];
    $rp=$_POST['rp'];
    $sortname=$_POST['sortname'];
    $sortorder=$_POST['sortorder'];
    $id=$_POST['id'];
    $start=$_POST['start'];
    $fromStar=$_POST['fromStar'];
    $toStar=$_POST['toStar'];
    $pageStart=$rp*($page-1);
    $total=$_POST['total'];

    //$query="insert logs set type='sim_search',content='id:" . $id .",start:" . $start . "',ip='" . get_onlineip() . "'";
    //mysql_query($query,$conn);
    if (!$total){
         $query ="SELECT count(distinct(a.compare_id))
            FROM quest_sim a 
            left join dol_city b on a.start=b.id
            left join quest c on c.id=a.compare_id
            left join quest_skills d on d.quest_id=a.compare_id
            where a.quest_id=" . $id . " and b.city_name='". $start ."' " . $skillFilter .
            " and c.star>=". $fromStar . " and c.star<=" . $toStar;
        $result=mysql_query($query,$conn);
        list($total) = mysql_fetch_row($result);       
    }


    $query ="SELECT distinct(a.compare_id) as quest_id,c.name,
            c.appendroute as append_route,
            c.skills as skills,
        c.star,
        a.value
        FROM quest_sim a 
        left join dol_city b on a.start=b.id
        left join quest c on c.id=a.compare_id
        left join quest_skills d on d.quest_id=a.compare_id
        where a.quest_id=" . $id . " and b.city_name='". $start ."' " . $skillFilter .
        " and c.star>=". $fromStar . " and c.star<=" . $toStar .
        " order by ". $sortname ." ". $sortorder ." ,compare_id asc limit " . $pageStart . ",". $rp;
    $result=mysql_query($query,$conn);
    $return['post']=$_POST;
    $return['page']=$page;
    $return['total']=$total;
    $rows=array();
    while($questInfo=mysql_fetch_object($result))
    {   
        $row['cell']=$questInfo;
        $row['id']=$questInfo->quest_id;
        array_push($rows,$row);
    }
    $return['rows']=$rows;
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
