<?php

// Lägg till följande rader vid problem med Access-Control-Allow-Origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
  header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Max-Age: 86400');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
      header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
      header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
  exit(0);
}

// En PHP-Fil som tar emot data
$response = file_get_contents("php://input");

// Skicka tillbaka response-info för att testa

echo $response;

// Omvandla (convert) JSON till ett PHP-Objekt
$request = json_decode($response);

// Lagra data från objektet i olika variabler
$email = $request->email;
$fname = $request->fname;
$lname = $request->lname;
$gender = $request->gender;
$mobile = $request->mobile;
$adults = $request->adults;
$child = $request->child;
$adate = $request->adate;
$ddate = $request->ddate;
$nights = $request->nights;
$price = $request->price;
$roomid = $request->roomid;
$roomname = $request->roomname;
$total = $request->total;

$btime = date("Y-m-d H:i:s",time());

// send email
$adatestr = substr($adate, 0, 10);
$ddatestr = substr($ddate, 0, 10);
$infmt ="<p><b>Name:</b> $fname $lname  <b>Mobile:</b> $mobile  <b>Email:</b> $email \r\n</P>".
        "<p><b>Adults:</b> $adults  <b>Children:</b> $child \r\n</p>".
        "<p><b>Room:</b> $roomname  <b>Price:</b> $price kr \r\n</p>".
        "<p><b>Arrival Date:</b> $adatestr  <b>Departual Date:</b> $ddatestr \r\n</p>".
        "<p><b>Nights:</b> $nights \r\n</p>".
        "<p><b>Total:</b> $total kr \r\n</p>".
        "<p>Welcome!</p>";

$message = "<h2>Thank you, $fname $lname. Here comes your reservation from us:\r\n</h2>".
           "$infmt";
$subject = "Hotel Bed & Breakfast - Your reservation from us";
$headers = "From: admin@yangshan.dx.am \r\n".
           "MIME-Version: 1.0" . "\r\n" .
           "Content-type: text/html; charset=UTF-8" . "\r\n";
      
if ($email != "") {
    mail($email, $subject, $message, $headers);
}


// Logga in i databasen!
$dbHost = "fdb18.awardspace.net";
$dbUser = "2673761_contacts";
$dbPass = "liangshan87";
$dbName = "2673761_contacts";

$connection = mysqli_connect($dbHost , $dbUser , $dbPass , $dbName);
if(!$connection){
    echo "<h1>" . mysqli_connect_error() . "</h1>"; exit;
}
mysqli_set_charset($connection, "utf8");

// Förberedd en SQL-sats
if ($email!="") {
    $sql = "INSERT INTO reservations VALUES ('', '$email', '$fname', '$lname', '$gender', '$mobile', '$adults', '$child', '$roomid', '$nights', '$price', '$total', '$adate', '$ddate', '$btime')";

    // Exekvera (kör) SQL-satsen send data to database
    mysqli_query($connection , $sql) or die(mysqli_error($connection));
        
}

// hämta data från databas
$query="SELECT * FROM rooms";

$table=mysqli_query($connection, $query) 
or die(mysql_error($connection));

$rows=array();

while($row = mysqli_fetch_assoc($table)) {
    $rows[] = $row;
 }
 echo json_encode($rows);


 //booking data 获取多个数据库，需要编辑下echo json 最后echo一次
 //$getemail = "yangshan.liu55@gmail.com";
 //$query2="SELECT * FROM reservations WHERE email = '$getemail'";

//$table2=mysqli_query($connection, $query2) 
//or die(mysql_error($connection));

//$rows2=array();

//while($row2 = mysqli_fetch_assoc($table2)) {
    //$rows2[] = $row2;
 //}
 //echo json_encode($rows);

?>
