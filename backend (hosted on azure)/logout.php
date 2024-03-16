<?php
	include('dbdata.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$status = false;
	$message = 'Could not authenticate your session';
	if(isset($_POST['username']) && isset($_POST['session'])){
		$username = mysqli_real_escape_string($db, $_POST['username']);
		$session = mysqli_real_escape_string($db, $_POST['session']);
		$id=authenticate($username, $session, false);
		if($id){
			if($db->connect_error){
				$message = 'Could not connect to database';
			}
			else{
				$sql = "UPDATE $accountstable SET session='' WHERE id='$id'";
				if($db->query($sql)===TRUE){
					$status = true;
				}
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>