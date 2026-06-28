<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include("../config/db.php");

// Get the current user's ID from the request
$myId = isset($_GET['my_id']) ? intval($_GET['my_id']) : 0;

// This query matches your EXACT column names from image_e39bc9.jpg
$sql = "
SELECT id, name, biometric_id, designation 
FROM users 
WHERE status = 'approved' AND id != $myId
";

$res = mysqli_query($conn, $sql);

$users = [];
if ($res) {
    while($row = mysqli_fetch_assoc($res)){
        $users[] = $row;
    }
}

echo json_encode($users);
?>