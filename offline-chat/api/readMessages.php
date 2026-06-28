<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
error_reporting(0);
include("../config/db.php");

$reader_id = $_POST['reader_id'] ?? 0; 
$chat_partner_id = $_POST['chat_partner_id'] ?? 0; 
$group_id = $_POST['group_id'] ?? 0; 

if ($reader_id == 0) {
    echo json_encode(["status" => "error", "message" => "Missing reader ID"]);
    exit;
}

if ($group_id > 0) {
    // For groups: Mark all messages as read that were NOT sent by the current reader
    $sql = "UPDATE messages SET is_read = 1, seen = 1 WHERE group_id = ? AND sender_id != ? AND is_read = 0";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("ii", $group_id, $reader_id);
        $stmt->execute();
    }
} else if ($chat_partner_id > 0) {
    // For 1-on-1: Mark messages sent BY the partner TO the reader as read
    $sql = "UPDATE messages SET is_read = 1, seen = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("ii", $chat_partner_id, $reader_id);
        $stmt->execute();
    }
}

echo json_encode(["status" => "success"]);
?>