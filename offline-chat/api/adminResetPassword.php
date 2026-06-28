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

// 1. Define the temporary password
$temp_password = "Workspace@123";

// 2. Hash it securely
$hashed_password = password_hash($temp_password, PASSWORD_DEFAULT);

// 3. Update the database for this specific user
$sql = "UPDATE users SET password = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $hashed_password, $user_id);

if($stmt->execute()) {
    echo json_encode([
        'status' => 'success', 
        'message' => 'Password reset successful.',
        'temp_password' => $temp_password 
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to reset password.']);
}

$stmt->close();
$conn->close();
?>