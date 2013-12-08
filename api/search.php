<?php
    require_once("../includes/conn.php");
    header('Content-type: application/json');

    $keyword=$_GET['kw'] . "%";
    $conn=Conn::GetConn();
    $query = "SELECT * FROM dol_city WHERE city_name LIKE '". $keyword ."' or for_short LIKE '%," . $keyword . "'";
    $result=mysql_query($query,$conn);
    if(!$result)
        return;
    $return=array();
    while($row=mysql_fetch_object($result))
    {   
        array_push($return,$row);
    }
    echo json_encode($return);
?>
