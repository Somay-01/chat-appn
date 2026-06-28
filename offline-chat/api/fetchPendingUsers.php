<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/db.php';

// Fetch anyone who is 'pending' using the new column names
$sql = "SELECT id, name, biometric_id, designation, role FROM users WHERE status = 'pending'";
$result = $conn->query($sql);

$users = [];
while($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode(['status' => 'success', 'data' => $users]);
?>