<?php
    $dburl='crowdapp-mysqldbserver.mysql.database.azure.com';
	$dbname='mysqldatabase38735';
	$dbusername='mysqldbuser@crowdapp-mysqldbserver';
	$dbpassword='Dapolskin00b';
	$accountstable = 'accounts';
	$reportstable = 'reports';
	$likestable = 'likes';
	$dislikestable = 'dislikes';
	$imagefolder = 'pictures/';
	$thumbfolder = 'thumbnails/';
	$thumb_width = 128;
	$thumb_height = 128;
	$db = mysqli_connect($dburl, $dbusername, $dbpassword, $dbname);
?>