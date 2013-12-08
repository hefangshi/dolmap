<?php
    require_once("../includes/QuestModel.php");
    header('Content-type: application/json');


    $method=$_GET['method'];
    switch ($method) {
        case 'queryList':
            queryList();
            break;
        case 'queryInfo':
            queryInfo();
            break;  
        case 'filterSearch':
            filterSearch();
            break;       
        default:
            break;
    }

    function queryList(){
        $keyword=$_GET['kw'];
        $model=new QuestModel();
        $result=$model->QueryByKeyword($keyword);
        echo json_encode($result);       
    }

    function queryInfo(){
        $id=$_GET['id'];
        $model=new QuestModel();
        $result=$model->GetQuest($id);
        echo json_encode($result);       
    }    

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

    function filterSearch(){
        $conn=Conn::GetConn();
        $page=$_POST['page'];
        $rp=min($_POST['rp'],50);
        $sortname=$_POST['sortname'];
        $sortorder=$_POST['sortorder'];
        $start=$_POST['start'];
        $end=$_POST['end'];
        $total=$_POST['total'];
        $pageStart=$rp*($page-1);   

        //$query="insert logs set type='filter_search',content='start:" . $start .",end:" . $end . "',ip='" . get_onlineip() . "'";
        //mysql_query($query,$conn);
        if (!$total){
             $query ="SELECT count(distinct(c.id))
                FROM quest_routes a ";
            if ($end)
                $query=$query . " left join quest_routes b on a.quest_id=b.quest_id";
            $query=$query . " left join quest c on c.id=a.quest_id
                where 1=1 " . $skillFilter;
            if ($start)
                $query = $query ." and a.route='". $start ."' and a.route_type=0 ";
            if ($end)
                $query=$query . " and b.route='". $end ."' and 
            b.route_index=(select max(route_index) from quest_routes where quest_id=a.quest_id and route_type=1)";
            $result=mysql_query($query,$conn);
            list($total) = mysql_fetch_row($result);               
        }
        $query ="SELECT distinct(c.id),c.name,c.star,
            c.start as start,
            c.appendroute as append_route,
            c.skills as skills
            FROM quest_routes a  ";
        if ($end)
            $query=$query . " left join quest_routes b on a.quest_id=b.quest_id";
        $query=$query . " left join quest c on c.id=a.quest_id
            where 1=1 " . $skillFilter;
        if ($start)
            $query = $query ." and a.route='". $start ."' and a.route_type=0 ";
        if ($end)
            $query=$query . " and b.route='". $end ."' and 
        b.route_index=(select max(route_index) from quest_routes where quest_id=a.quest_id and route_type=1)";
        $query=$query . " order by ". $sortname ." ". $sortorder ." ,c.id asc limit " . $pageStart . ",". $rp;
        $result=mysql_query($query,$conn);
        $return['post']=$_POST;
        $return['page']=$page;
        $return['total']=$total;
        $rows=array();
        while($questInfo=mysql_fetch_object($result))
        {   
            $row['cell']=$questInfo;
            $row['id']=$questInfo->id;
            array_push($rows,$row);
        }
        $return['rows']=$rows;
        echo json_encode($return);
    }

?>
