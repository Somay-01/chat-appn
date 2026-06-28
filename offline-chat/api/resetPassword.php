<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/db.php';

$identifier = $_POST['identifier'] ?? '';
$new_password = $_POST['new_password'] ?? '';

// 1. Check if fields are empty
if(empty($identifier) || empty($new_password)) {
    echo json_encode(['status' => 'error', 'message' => 'Please provide Name/Biometric ID and your new password.']);
    exit();
}

// 2. Hash the new password
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

// 3. Update the password where the Name OR Biometric ID matches
$sql = "UPDATE users SET password = ? WHERE name = ? OR biometric_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $hashed_password, $identifier, $identifier);

if($stmt->execute()) {
    // Check if any rows were actually updated (meaning the user existed)
    if($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Password reset successfully!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No user found with that Name or Biometric ID.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error during password reset.']);
}

$stmt->close();
$conn->close();
?>