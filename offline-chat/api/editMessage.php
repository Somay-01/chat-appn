<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
include("../config/db.php"); // Make sure this path is correct!

$message_id = $_POST['message_id'] ?? 0;
$user_id = $_POST['user_id'] ?? 0;
$new_message = $_POST['new_message'] ?? '';

if ($message_id && $user_id && $new_message !== '') {
    // Only allow editing if the person requesting it is the actual sender of the message!
    $stmt = $conn->prepare("UPDATE messages SET message = ?, is_edited = 1 WHERE id = ? AND sender_id = ?");
    $stmt->bind_param("sii", $new_message, $message_id, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database update failed"]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Missing data"]);
}
$conn->close();
?>