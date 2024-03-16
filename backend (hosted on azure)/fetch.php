<?php
	include('dbdata.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$status = false;
	$points = array();
	$message = 'Could not authenticate your session';
	$username = mysqli_real_escape_string($db, $_POST['username']);
	$session = mysqli_real_escape_string($db, $_POST['session']);
	$id=authenticate($username, $session, false);
	if($id){
		if($db->connect_error){
			$message = 'Could not connect to database';
		}
		else{
			$status = true;
			$sql = "SELECT * FROM $reportstable";
			$result = $db->query($sql);
			while($row=$result->fetch_assoc())
			{
				$report_id = $row['id'];
				$liked = false;
				$disliked = false;
				$sql = "SELECT id FROM $likestable WHERE user_id='$id' AND report_id='$report_id'";
				$likeresults = $db->query($sql);
				if($likeresults->num_rows>0)
					$liked=true;
				$sql = "SELECT id FROM $dislikestable WHERE user_id='$id' AND report_id='$report_id'";
				$likeresults = $db->query($sql);
				if($likeresults->num_rows>0)
					$disliked=true;
				$row['userliked']=$liked;
				$row['userdisliked']=$disliked;
				array_push($points, $row);
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message, 'points' => $points);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>