<?php
    require_once("conn.php");

    class QuestModel{
        private $conn;

        public function __construct(){
            $this->conn=Conn::GetConn();
        }

        private function get_onlineip() {  
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

        public function QueryByKeyword($keyword){
            $query="insert logs set type='quest_list',content='" . $keyword . "',ip='" . $this->get_onlineip() . "'";
            //mysql_query($query,$this->conn);
            $query = "SELECT id,name FROM quest WHERE for_short LIKE '" . $keyword ."%' OR name LIKE '%" . $keyword . "%' OR discovery LIKE '%". $keyword ."%' limit 15";
            $result=mysql_query($query,$this->conn);
            $ret=array();
            if ($result==false){
                return $ret;
            }
            while($row=mysql_fetch_object($result))
            {   
                array_push($ret, $row);
            }
            return $ret;
        }

        public function GetQuest($id)
        {
            $query="insert logs set type='quest_info',content='" . $id . "',ip='" . $this->get_onlineip() . "'";
            //mysql_query($query,$this->conn);
            $query = "SELECT * FROM quest WHERE id =" . $id;
            $result=mysql_query($query,$this->conn);
            $info=mysql_fetch_object($result);
            $info->routes=$this->GetRoutes($id);
            $info->relation=$this->GetRelations($id);
            $info->skills=$this->GetSkills($id);
            return $info;
        }


        public function GetRoutes($id)
        {
            $query = "SELECT route_type,route,route_index,b.x,b.y FROM quest_routes a left join dol_city b on " .
                    "b.city_name =a.route WHERE quest_id =" . $id ." ORDER BY route_index";
            $result=mysql_query($query,$this->conn);
            $ret=array();
            while($row=mysql_fetch_object($result))
            {   
                array_push($ret, $row);
            }
            return $ret;
        }

        public function GetRelations($id)
        {
            $query = "SELECT b.id,b.name,a.relation_type FROM quest_relation a left join quest b on a.relation_id=b.id WHERE quest_id =" . $id;
            $result=mysql_query($query,$this->conn);
            $ret=array();
            while($row=mysql_fetch_object($result))
            {   
                array_push($ret, $row);
            }
            return $ret;
        }

        public function GetSkills($id)
        {
            $query = "SELECT skill,level FROM quest_skills WHERE quest_id =" . $id;
            $result=mysql_query($query,$this->conn);
            $ret=array();
            while($row=mysql_fetch_object($result))
            {   
                array_push($ret, $row);
            }
            return $ret;
        }
    }

?>