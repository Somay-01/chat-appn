<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/db.php';

// Fetch users who are already approved
$sql = "SELECT id, name, biometric_id, designation, role FROM users WHERE status = 'approved'";
$result = $conn->query($sql);

$users = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode(['status' => 'success', 'data' => $users]);
?>