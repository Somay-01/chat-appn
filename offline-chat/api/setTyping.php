<?php  //update the db when a user press a key
include("../config/db.php");
$data = json_decode(file_get_contents("php://input"), true);

$my_id = $data['my_id'];
$typing_to = $data['typing_to']; // Will be a user ID, or 0 if they stopped typing

$stmt = $conn->prepare("UPDATE users SET typing_to = ? WHERE id = ?");
$stmt->bind_param("ii", $typing_to, $my_id);
$stmt->execute();
?>