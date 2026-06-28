<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
error_reporting(0);
include("../config/db.php");

$message_id = $_POST['message_id'] ?? 0;
$user_id = $_POST['user_id'] ?? 0;

if ($message_id > 0 && $user_id > 0) {
    // 1. Fetch message details to determine sender and group context
    $stmt = $conn->prepare("SELECT sender_id, group_id FROM messages WHERE id = ?");
    $stmt->bind_param("i", $message_id);
    $stmt->execute();
    $msg = $stmt->get_result()->fetch_assoc();

    if (!$msg) {
        echo json_encode(["status" => "error", "message" => "Message not found"]);
        exit;
    }

    $is_sender = ($msg['sender_id'] == $user_id);
    $is_admin = false;

    // 2. If it's a group message, check if the user is an admin of that group
    if ($msg['group_id'] > 0) {
        $stmt_admin = $conn->prepare("SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'admin'");
        $stmt_admin->bind_param("ii", $msg['group_id'], $user_id);
        $stmt_admin->execute();
        if ($stmt_admin->get_result()->num_rows > 0) {
            $is_admin = true;
        }
    }

    // 3. Logic: Allow deletion if sender OR group admin
    if ($is_sender || $is_admin) {
        $stmt_del = $conn->prepare("UPDATE messages SET is_deleted = 1 WHERE id = ?");
        $stmt_del->bind_param("i", $message_id);

        if ($stmt_del->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => $stmt_del->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Unauthorized: You do not have permission to delete this message."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid ID"]);
}
?>