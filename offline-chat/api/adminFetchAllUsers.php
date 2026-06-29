<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include("../config/db.php");

// Fetch all registered users from the database
$query = "SELECT id, name, biometric_id, designation, status FROM users ORDER BY id DESC";
$result = $conn->query($query);

$users = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode($users);
?>