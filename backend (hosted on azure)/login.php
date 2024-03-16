<?php
	include('dbdata.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$status = false;
	$message = '';
	$session = '';
	$username = '';
	if(!isset($_POST['username']) || !isset($_POST['password']) || !isset($_POST['userstatus'])){
		$message = 'Incorrect form data';
	}
	else
	{
		if($db->connect_error){
			$message = 'Could not connect to database';
		}
		else if(!isset($_POST['username'])){
			$message = 'Username is required';
		}
		else if(!isset($_POST['password'])){
			$message = 'Password is required';
		}
		else{
			$username = mysqli_real_escape_string($db, $_POST['username']);
			$password = mysqli_real_escape_string($db, $_POST['password']);
			$userstatus_boolean = mysqli_real_escape_string($db, $_POST['userstatus']);
			if($userstatus_boolean=="true")
				$userstatus=1;
			else
				$userstatus=0;
			$sql = "SELECT id FROM $accountstable WHERE username='$username' AND password='$password' AND userstatus='$userstatus'";
			$result = $db->query($sql);
			if($result->num_rows>0){
				$row=$result->fetch_assoc();
				$id=$row['id'];
				$testsession=md5(uniqid());
				$sql = "UPDATE $accountstable SET session='$testsession' WHERE id='$id'";
				if($db->query($sql)==TRUE){
					$session = $testsession;
					$status = true;
				}
				else
					$message = 'Could not connect to database';
			}
			else
			{
				$message = 'No user found with that data';
			}
			
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message, 'session' => $session);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>