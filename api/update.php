<?php
    require_once("../includes/conn.php");
    header('Content-type: application/json');

    $point=json_decode($_POST['point']);
    $city=$_POST['city'];
    $conn=Conn::GetConn();
    $query = "UPDATE dol_city SET x=" . $point->x . ",y=" . $point->y . " WHERE city_name = '" . $city . "'";
    $result=mysql_query($query,$conn);
?>
