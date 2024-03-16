<?php
	include('dbdata.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$username = mysqli_real_escape_string($db, $_POST['username']);
	$session = mysqli_real_escape_string($db, $_POST['session']);
	$action = mysqli_real_escape_string($db, $_POST['action']);
	$report = mysqli_real_escape_string($db, $_POST['id']);
	$status = false;
	$table = '';
	$message = 'Could not authenticate your session';
	$id=authenticate($username, $session, false);
	if($id){
		$message = 'incomplete action data';
		if(!empty($action) && !empty($action)){
			if($db->connect_error){
				$message = 'Could not connect to database';
			}
			else if($action!='like' && $action!='dislike')
				$message = 'Incorrect action';
			else{
				$liked = false;
				$disliked = false;
				$sql = "SELECT id FROM $likestable WHERE report_id='$report' AND user_id='$id'";
				$result = $db->query($sql);
				if($result->num_rows>0){
					$liked = true;
				}
				$sql = "SELECT id FROM $dislikestable WHERE report_id='$report' AND user_id='$id'";
				$result = $db->query($sql);
				if($result->num_rows>0){
					$disliked = true;
				}
				if($action=='like')
				{
					if($liked){
						$db->query("UPDATE $reportstable SET likes=likes-1 WHERE id='$report'");
						$db->query("DELETE FROM $likestable WHERE report_id='$report' AND user_id='$id'");
					}
					else if($disliked){
						$db->query("UPDATE $reportstable SET likes=likes+1 WHERE id='$report'");
						$db->query("UPDATE $reportstable SET dislikes=dislikes-1 WHERE id='$report'");
						$db->query("DELETE FROM $dislikestable WHERE report_id='$report' AND user_id='$id'");
						$db->query("INSERT INTO $likestable (report_id, user_id) VALUES ('$report', '$id')");
					}
					else{
						$db->query("UPDATE $reportstable SET likes=likes+1 WHERE id='$report'");
						$db->query("INSERT INTO $likestable (report_id, user_id) VALUES ('$report', '$id')");
					}
				}
				else
				{
					if($disliked){
						$db->query("UPDATE $reportstable SET dislikes=dislikes-1 WHERE id='$report'");
						$db->query("DELETE FROM $dislikestable WHERE report_id='$report' AND user_id='$id'");
					}
					else if($liked){
						$db->query("UPDATE $reportstable SET dislikes=dislikes+1 WHERE id='$report'");
						$db->query("UPDATE $reportstable SET likes=likes-1 WHERE id='$report'");
						$db->query("DELETE FROM $likestable WHERE report_id='$report' AND user_id='$id'");
						$db->query("INSERT INTO $dislikestable (report_id, user_id) VALUES ('$report', '$id')");
					}
					else{
						$db->query("UPDATE $reportstable SET dislikes=dislikes+1 WHERE id='$report'");
						$db->query("INSERT INTO $dislikestable (report_id, user_id) VALUES ('$report', '$id')");
					}
				}
				$message = $id;
				$status = true;
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>