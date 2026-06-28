<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
error_reporting(0);
include("../config/db.php");

$message_id = $_POST['message_id'] ?? 0;
$action = $_POST['action'] ?? 'pin'; // 'pin' or 'unpin'

if ($message_id == 0) {
    echo json_encode(["status" => "error", "message" => "Missing message ID"]);
    exit;
}

$pin_value = ($action === 'pin') ? 1 : 0;
$sql = "UPDATE messages SET is_pinned = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $pin_value, $message_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "is_pinned" => $pin_value]);
} else {
    echo json_encode(["status" => "error", "message" => "Database failed"]);
}
?>