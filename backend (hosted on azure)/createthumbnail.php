<?php
	include('dbdata.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$username=mysqli_real_escape_string($db, $_POST['username']);
	$session=mysqli_real_escape_string($db, $_POST['session']);
	$category=mysqli_real_escape_string($db, $_POST['category']);
	$description=mysqli_real_escape_string($db, $_POST['description']);
	$details=mysqli_real_escape_string($db, $_POST['details']);
	$x=mysqli_real_escape_string($db, $_POST['x']);
	$y=mysqli_real_escape_string($db, $_POST['y']);
	$message='Could not authenticate your session, try to log out and reconnect';
	$status=false;
	if(empty($description)){
		$message='Description is required';
	}
	else if(empty($x) || empty($y)){
		$message='Coordinates are required';
	}
	else{
		if(authenticate($username, $session, false)){
			$sql = "INSERT INTO $reportstable (category, description, details, x, y, likes, dislikes) 
					VALUES ('$category', '$description', '$details', '$x', '$y', '0', '0')";
			$db->query($sql);
			if(!empty($_FILES['image']))
			{
				$id=$db->insert_id;
				$img=$_FILES['image']['name'];
				$tmp=$_FILES['image']['tmp_name'];
				$ext=strtolower(pathinfo($img, PATHINFO_EXTENSION));
				$final_image=$id.".".$ext;
				$valid_extensions = array('jpeg', 'jpg', 'png', 'gif', 'bmp' , 'pdf' , 'doc' , 'ppt');
				if(in_array($ext, $valid_extensions))
				{
					$path=$imagefolder.strtolower($final_image);
					if(move_uploaded_file($tmp, $path))
					{
						$thumb=imagecreatetruecolor($thumb_width,$thumb_height);
						$thumb_path = $thumbfolder.strtolower($final_image);
						list($width,$height) = getimagesize($path);
						switch($ext){
							case 'jpg':
								$src = imagecreatefromjpeg($path);
								break;
							case 'jpeg':
								$src = imagecreatefromjpeg($path);
								break;

							case 'png':
								$src = imagecreatefrompng($path);
								break;
							case 'gif':
								$src = imagecreatefromgif($path);
								break;
							default:
								$src = imagecreatefromjpeg($path);
						}
						imagecopyresized($thumb,$src,0,0,0,0,$thumb_width,$thumb_height,$width,$height);
						switch($ext){
							case 'jpg' || 'jpeg':
								imagejpeg($thumb,$thumb_path,100);
								break;
							case 'png':
								imagepng($thumb,$thumb_path,100);
								break;

							case 'gif':
								imagegif($thumb,$thumb_path,100);
								break;
							default:
								imagejpeg($thumb,$thumb_path,100);
						}
						$sql="UPDATE $reportstable SET imagefile='$path',thumbfile='$thumb_path' WHERE id='$id'";
						$db->query($sql);
					}
				}
			}
			$message='Report sent';
			$status=true;
			
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');


?>