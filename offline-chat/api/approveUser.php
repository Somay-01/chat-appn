<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/db.php';

$user_id = $_POST['user_id'] ?? '';

if(empty($user_id)){
    echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
    exit();
}

// Flip their status to 'approved'
$sql = "UPDATE users SET status = 'approved' WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);

if($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'User approved successfully!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to approve user.']);
}
?>