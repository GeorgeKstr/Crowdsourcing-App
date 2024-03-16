<?php
	function authenticate($username, $session, $status){
		include('dbdata.php');
		if(empty($username)||empty($session))
			return false;
		$sql = "SELECT id,userstatus FROM $accountstable WHERE username='$username' AND session='$session'";
		if($db->connect_error){
			return false;
		}
		else{
			$result = $db->query($sql);
			if($result->num_rows>0){
				$row=$result->fetch_assoc();
				$userstatus=$row['userstatus'];
				$id=$row['id'];
				if($userstatus==true || $status==false)
					return $id;
			}
		}
		return false;
	}
?>