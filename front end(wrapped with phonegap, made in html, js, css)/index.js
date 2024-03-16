var map;
var domain_url = 'localhost';
var username;
var password;
var user_status;
var remember_me;
var session_token;
var current_point;
remember_me=false;
var geo_x;
var geo_y;
var geotag;
var pid=0;
var pcategory=1;
var px=2;
var py=3;
var pdescription=4;
var pdetails=5;
var pimage=6;
var pthumbnail=7;
var plikes=8;
var pdislikes=9;
var puser_liked=10;
var puser_disliked=11;
var pdate=12;
var points=[];
function fetchPoints(){
	var  data="username="+username+"&session="+session_token;
	$.ajax({
		url: domain_url+'fetch.php',
		data: data,
		type: 'post',
		async: 'true',
		beforeSend: function() {
			while(points.length > 0)
				points.pop();
			$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
		},
		complete: function() {
			// This callback function will trigger on data sent/received complete
			$.mobile.loading('hide'); // This will hide ajax spinner
			
		},
		success: function (result) {
			if(result.status) {
				items = result.points;
				for(var i=0; i<items.length; i++)
				{
					var item = [
									parseInt(items[i].id),
									parseInt(items[i].category),
									parseFloat(items[i].x),
									parseFloat(items[i].y),
									items[i].description,
									items[i].details,
									items[i].imagefile,
									items[i].thumbfile,
									parseInt(items[i].likes),
									parseInt(items[i].dislikes),
									items[i].userliked,
									items[i].userdisliked,
									items[i].date
							];
					points.push(item);
				}
				if(map)
				{
					for(var i=0; i<points.length; i++){
						var placemark = new L.Marker(new L.LatLng(points[i][px], points[i][py])).bindPopup(getPopup(i));
						console.log('added a marker');
						placemark.addTo(map);
					}
				}
				if(current_point<points.length)
					view_point(current_point);
			} else {
				alert(result.message);
			}
		},
		error: function (xhr, status, error) {
			alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
		}
	});
}

function view_point(i){
	console.log(points[1]);
	document.getElementById("point_name").innerHTML=points[i][pdescription];
	document.getElementById("point_details").innerHTML=points[i][pdetails];
	document.getElementById("point_location").innerHTML="x="+points[i][px]+"<br>y="+points[i][py];
	if(points[i][pimage])
	{
		document.getElementById("point_image").src=domain_url+points[i][pimage];
		$("#point_image").show();
	}
	else
		$("#point_image").hide();
	document.getElementById("point_time").innerHTML=points[i][pdate];
	$("#likebutton").html("Υπερψήφιση ("+points[i][plikes]+")");
	if(points[i][puser_liked])
		$("#likebutton").addClass("ui-btn-active");
	else
		$("#likebutton").removeClass("ui-btn-active");
	$("#dislikebutton").html("Καταψήφιση ("+points[i][pdislikes]+")");
	if(points[i][puser_disliked])
		$("#dislikebutton").addClass("ui-btn-active");
	else
		$("#dislikebutton").removeClass("ui-btn-active");
	current_point=i;
}
function inspect_point(i){
	view_point(i);
	$.mobile.changePage("#point_page");
}
function getCategoryFromNumber(i){
	switch(i){
		case 1:
			return "Γενικά";
		case 2:
			return "Οδικά Θέματα Και Φωτισμός";
		case 3:
			return "Περιβαλλοντικά Θέματα Και Καθαρισμός";
		case 4:
			return "Εργασίες";
		case 5:
			return "Συντηρήσεις";
		default:
			return "Άγνωστο";
	}
}
function getPopup(pi)
{
	var id=points[pi][pid];
	var category=points[pi][pcategory];
	var x=points[pi][px];
	var y=points[pi][py];
	var description=points[pi][pdescription];
	var details=points[pi][pdetails];
	var thumbnail=points[pi][pthumbnail];
	var likes=points[pi][plikes];
	var dislikes=points[pi][pdislikes];
	var liked=points[pi][puser_liked];
	var disliked=points[pi][puser_disliked];
	var finalstring="<a onclick=\"inspect_point("+pi+");\"><div>"+
					"<h1>Περιγραφή:</h1>"+
					"<h2>"+description+"</h2>"+
					"<h1>Κατηγορία:</h1>"+
					"<p>"+getCategoryFromNumber(category)+"</p>"+
					"<h1>Βαθμολογία:</h1>"+
					"<h2>Υπερψηφίσεις: "+likes+"<br>Καταψηφίσεις: "+dislikes+"</h2>";
	if(thumbnail)
		finalstring+="<img src=\""+domain_url+thumbnail+"\">";
	finalstring+="<h1>Συντεταγμένες:</h1><p>x="+x+"<br>y="+y+"</p></h1>";
	finalstring+="</div></a>";
	return finalstring;
}
function createmap(){
	map = L.map('mapid');
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiaWNzZDE1MTAxIiwiYSI6ImNqcDBpOGlhdjJ2c2gzcGxrZnpycXlkaGIifQ.xUGN-mwjGqF6DqB-48YEsQ'
	}).addTo(map);
	var customOptions =
    {
        'maxWidth': '500',
        'className' : 'custom'
    }
	map.on('locationfound', function (e) {
		var radius = e.accuracy / 2;
	 
		L.marker(e.latlng).addTo(map)
		.bindPopup("You are within " + radius + " meters from this point").openPopup();
	 
		L.circle(e.latlng, radius).addTo(map);
	});
	
	map.invalidateSize();
	map.locate({
		setView: true,
		maxZoom: 18,
		enableHighAccuracy: true,
		maximumAge: 60000
	}); 
	fetchPoints();
}
$(document).ready(function () {
	geotag=document.getElementById("geotag");
	if(localStorage.getItem('remember')=='true')
	{
		$("#rememberbox").click();
		$("#username").val(localStorage.getItem('username'));
		$("#password").val(localStorage.getItem('password'));
		if(localStorage.getItem('userstatus')=='true')
			$("#userstatus").click();
		remember_me=true;
	}
	$("#login_form").on('submit', function(){
		setUserValues();
		var data = "username="+username+"&password="+password+"&userstatus="+user_status;
		$.ajax({
			url: domain_url+'login.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true});},
			complete: function() { $.mobile.loading('hide'); },
			success: function (result) {
				if(result.status) {
					rememberData();
					document.getElementById("username_header").innerHTML=username;
					if(user_status){
						document.getElementById("main_header").innerHTML="Καρτέλα Υπαλλήλου";
						$("#filter_option").show();
					}
					else {
						document.getElementById("main_header").innerHTML="Καρτέλα Πολίτη";
						$("#filter_option").hide();
					}
					$.mobile.changePage("#main_page");
					session_token=result.session;
					//alert(session_token);
				} else {
					alert('Authentication failed: '+result.message);
					localStorage.setItem('remember', 'false');
					location.reload();
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
			}
		});
		return false;
	});
	$("#register_link").on('click', function() {
		$.mobile.changePage("#register_page");
	});
	$("#register_form").on('submit', function(){
		var reg_username=$("#register_username").val();
		var reg_password=$("#register_password").val();
		var reg_password2=$("#register_password2").val();
		var reg_userstatus=false;
		if($("#register_userstatus").is(':checked'))
			reg_userstatus=true;
		var data = "username="+reg_username+"&password="+reg_password+"&password2="+reg_password2+"&userstatus="+reg_userstatus;
		$.ajax({
			url: domain_url+'register.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true});},
			complete: function() { $.mobile.loading('hide'); },
			success: function (result) {
				if(result.status) {
					alert('Registered successfuly!');
					$.mobile.changePage("#login_page");
					localStorage.setItem('remember', 'false');
					location.reload();
				} else {
					alert(result.message);
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
			}
		});
		return false;
	});
	$("#logout").on('click', function() {
		var  data="username="+username+"&session="+session_token;
		$.ajax({
			url: domain_url+'logout.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {
				// This callback function will trigger before data is sent
				$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
			},
			complete: function() {
				// This callback function will trigger on data sent/received complete
				$.mobile.loading('hide'); // This will hide ajax spinner
				$.mobile.changePage("#login_page");
				location.reload();
			},
			success: function (result) {
				if(result.status) {
					
				} else {
					alert(result.message);
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
			}
		});
	});
	$("#report_form").on('submit', function(){
		var dat = new FormData(this);
		dat.append('x', geo_x);
		dat.append('y', geo_y);
		dat.append('session', session_token);
		dat.append('username', username);
		$.ajax({
			url: domain_url+'report.php',
			data: dat,
			type: 'post',
			contentType: false,
			processData: false,
			async: 'true',
			
			beforeSend: function() {$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true});},
			complete: function() { $.mobile.loading('hide'); },
			success: function (result) {
				if(result.status) {
					alert(result.message);
					$("#preview").hide();
					document.getElementById("report_form").reset();
					$.mobile.changePage("#main_page");
				} else {
					alert(result.message);
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
			}
		});
		return false;
	});
	$("#filterform").on('submit', function() {
		var  data="username="+username+
				"&session="+session_token+
				"&fromdate="+$("#fromdate").val()+
				"&todate="+$("#todate").val()+
				"&xfrom="+$("#xfrom").val()+
				"&xto="+$("#xto").val()+
				"&yfrom="+$("#yfrom").val()+
				"&yto="+$("#yto").val();
		$.ajax({
			url: domain_url+'filter.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {
				// This callback function will trigger before data is sent
				$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
			},
			complete: function() {
				// This callback function will trigger on data sent/received complete
				$.mobile.loading('hide'); // This will hide ajax spinner
			},
			success: function (result) {
				if(result.status) {
					items = result.points;
					for(var i=0; i<items.length; i++)
					{
						var item = [
										parseInt(items[i].id),
										parseInt(items[i].category),
										parseFloat(items[i].x),
										parseFloat(items[i].y),
										items[i].description,
										items[i].details,
										items[i].imagefile,
										items[i].thumbfile,
										parseInt(items[i].likes),
										parseInt(items[i].dislikes),
										items[i].userliked,
										items[i].userdisliked,
										items[i].date
								];
						points.push(item);
					}
					$.mobile.changePage("#list_page");
				} else {
					alert(result.message);
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
			}
		});
		return false;
	});
	$("#preview").hide();
	document.getElementById("f1").onchange = function () {
		var reader = new FileReader();

		reader.onload = function (e) {
			// get loaded data and render thumbnail.
			document.getElementById("preview").src = e.target.result;
			$("#preview").show();
		};

		// read the image file as a data URL.
		reader.readAsDataURL(this.files[0]);
	};
	refreshLocation();
	function refreshLocation(){
		if (navigator.geolocation) {
			navigator.geolocation.watchPosition(setPosition);
		} else { 
			geotag.innerHTML = "Geolocation is not supported by this browser.";
			geo_x='0';
			geo_y='0';
		}
		
	}
	function setPosition(position) {
		geo_x = position.coords.latitude; 
		geo_y = position.coords.longitude;
		geotag.innerHTML = "x="+geo_x+"<br>y="+geo_y;
	}
	$("#refresh").on('click', refreshLocation);
	function setUserValues() {
		if($("#rememberbox").prop('checked'))
			remember_me = true;
		else
			remember_me = false;
		if($("#userstatus").prop('checked'))
			user_status = true;
		else
			user_status = false;
		username = $("#username").val();
		password = $("#password").val();
	}
	function rememberData() {
		if(remember_me){
			localStorage.setItem('username', username);
			localStorage.setItem('password', password);
			if(user_status)
				localStorage.setItem('userstatus', 'true');
			else
				localStorage.setItem('userstatus', 'false');
			localStorage.setItem('remember', 'true');
		}
		else
		{
			localStorage.setItem('username', '');
			localStorage.setItem('password', '');
			localStorage.setItem('userstatus', 'false');
			localStorage.setItem('remember', 'false');
		}
	}
	function score(action, id){
		var point_id = points[id][pid];
		console.log(point_id);
		var  data="username="+username+"&session="+session_token+"&action="+action+"&id="+point_id;
		$.ajax({
			url: domain_url+'score.php',
			data: data,
			type: 'post',
			async: 'true',
			beforeSend: function() {
				// This callback function will trigger before data is sent
				$.mobile.loading('show', {theme:"a", text:"Please wait...", textonly:true, textVisible: true}); // This will show ajax spinner
			},
			complete: function() {
				// This callback function will trigger on data sent/received complete
				$.mobile.loading('hide'); // This will hide ajax spinner
			},
			success: function (result) {
				if(result.status) {
					fetchPoints();
				} else {
					alert(result.message);
				}
			},
			error: function (xhr, status, error) {
				alert("ERROR - xhr.status: " + xhr.status + '\nxhr.responseText: ' + xhr.responseText + '\nxhr.statusText: ' + xhr.statusText + '\nError: ' + error + '\nStatus: ' + status);
			}
		});
	}
	function like(){
		score('like', current_point);
	}
	function dislike(){
		score('dislike', current_point);
	}
	function makelist(){
		$('#point_list').empty();
		for(var i=0; i<points.length; i++){
			var listitem = "<li><a onclick=\"inspect_point("+i+")\">";
			if(points[i][pthumbnail])
				listitem+="<img class=\"listthumb\" src=\""+domain_url+points[i][pthumbnail]+"\">";
			listitem+="<h2>"+points[i][pdescription]+"</h2>"+
						"<p>"+points[i][pdetails]+"</p>"+
						"<p>Υπερψηφίσεις: "+points[i][plikes]+"<br>Καταψηφίσεις: "+points[i][pdislikes]+"</p>"+
						"<p>Χρόνος: "+points[i][pdate]+"</p>"+
						"</a></li>";
			$('#point_list').append(listitem);
		}
		$('#point_list').listview("refresh");
	}
	$("#likebutton").on('click', like);
	$("#dislikebutton").on('click', dislike);
	$("#map_refresh").on('click', fetchPoints);
	$("#main_page").on('pageshow', fetchPoints);
	$("#map_page").on('pageshow', createmap);
	$("#map_page").on('pagehide', function(event){
		map.remove();
		map=null;
	});
	$("#list_page").on('pageshow', makelist);
	$( document ).bind( "mobileinit", function(){
		$.mobile.page.prototype.options.degradeInputs.date = true;
	});
	$('.numbersOnly').keyup(function () { 
		this.value = this.value.replace(/[^0-9\.]/g,'');
	});
});

 

 
