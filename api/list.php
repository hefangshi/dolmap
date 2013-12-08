<?php
    require_once("../includes/conn.php");
    header('Content-type: application/json');

    $conn=Conn::GetConn();
    $query = "SELECT * FROM dol_city WHERE x<>0 and y<>0";
    $result=mysql_query($query,$conn);
    $return=array();
    while($row=mysql_fetch_object($result))
    {   
        array_push($return,$row);
    }
    echo json_encode($return);
?>
