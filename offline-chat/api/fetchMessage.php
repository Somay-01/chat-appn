<?php
header('Content-Type: application/json');
include("../config/db.php");

$my_id = $_GET['sender_id'] ?? 0;
$receiver_id = $_GET['receiver_id'] ?? 0;
$group_id = $_GET['group_id'] ?? 0;

$messages = [];

if ($group_id > 0) {
    // Changed u.username to u.name
    $sql = "SELECT m.*, u.name as sender_name FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.group_id = ? AND m.is_deleted = 0 ORDER BY m.created_at ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $group_id);
} else {
    // Changed u.username to u.name[cite: 4]
    $sql = "SELECT m.*, u.name as sender_name FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)) 
            AND m.group_id = 0 AND m.is_deleted = 0 ORDER BY m.created_at ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiii", $my_id, $receiver_id, $receiver_id, $my_id);
}

if ($stmt && $stmt->execute()) {
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
}
echo json_encode($messages);
?>