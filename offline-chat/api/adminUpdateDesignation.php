<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include("../config/db.php");

$user_id = $_POST['user_id'] ?? 0;
$designation = $_POST['designation'] ?? '';

if ($user_id > 0) {
    $stmt = $conn->prepare("UPDATE users SET designation = ? WHERE id = ?");
    $stmt->bind_param("si", $designation, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid user data supplied."]);
}
?>