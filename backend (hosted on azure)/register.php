<?php
	include('dbdata.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$status = false;
	$message = '';
	if(!isset($_POST['username']) || !isset($_POST['password']) || !isset($_POST['password2']))
		$message = 'Incorrect form data';
	else
	{
		if($db->connect_error)
			$message = 'Could not connect to database';
		else{
			$username = mysqli_real_escape_string($db, $_POST['username']);
			$password = mysqli_real_escape_string($db, $_POST['password']);
			$password2 = mysqli_real_escape_string($db, $_POST['password2']);
			if(isset($_POST['userstatus']))
				$userstatus_boolean = mysqli_real_escape_string($db, $_POST['userstatus']);
			else
				$userstatus_boolean = '';
			if($userstatus_boolean)
				$userstatus=1;
			else
				$userstatus=0;
			if(empty($username))
				$message = 'Username is required';
			else if(empty($password))
				$message = 'Password is required';
			else if(empty($password2))
				$message = 'You need to fill both password fields';
			else if($password != $password2)
				$message = 'Passwords do not match';
			else{
				$sql = "SELECT id FROM $accountstable WHERE username='$username'";
				$result = $db->query($sql);
				if($result->num_rows>0)
					$message='An account with that username already exists !';
				else{
					$sql = "INSERT INTO $accountstable (username, password, userstatus) 
							VALUES ('$username', '$password', '$userstatus')";
					if($db->query($sql)===true)
						$status=true;
					else
						$message = 'Could not connect to database';
				}
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>