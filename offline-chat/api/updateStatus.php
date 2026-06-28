<?php
include("../config/db.php");

$user_id = $_POST['user_id'] ?? 0;
$status = $_POST['status'] ?? '';

if ($user_id > 0 && !empty($status)) {
    // Whitelist allowed statuses just to be secure
    $allowed_statuses = ['Available', 'In a Meeting', 'Do Not Disturb', 'Out of Office'];
    
    if (in_array($status, $allowed_statuses)) {
        $sql = "UPDATE users SET custom_status = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $status, $user_id);
        
        if ($stmt && $stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Status updated"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database error"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid status"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing data"]);
}
?>