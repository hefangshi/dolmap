<?php
class Conn{
	public static function GetConn(){
		/*从平台获取查询要连接的数据库名称*/
		$dbname = SAE_MYSQL_DB;		

		/*从环境变量里取出数据库连接需要的参数*/
		$host = SAE_MYSQL_HOST_M;
		$port = SAE_MYSQL_PORT;
		$user = SAE_MYSQL_USER;
		$pwd = SAE_MYSQL_PASS;		

		/*接着调用mysql_connect()连接服务器*/
		$link = @mysql_connect("{$host}:{$port}",$user,$pwd,true);
		if(!$link) {
		    die("Connect Server Failed:" . mysql_error());
		}
		/*连接成功后立即调用mysql_select_db()选中需要连接的数据库*/
		if(!mysql_select_db($dbname,$link)) {
		    die("Select Database Failed: " . mysql_error($link));
		}
	    mysql_query("set character set 'utf8'");
	    mysql_query('set names utf8');
		return $link;
	}
}
?>