<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include("../config/db.php");

$group_id = $_POST['group_id'] ?? 0;
$admin_id = $_POST['admin_id'] ?? 0;
$name = $_POST['name'] ?? '';
$is_broadcast = $_POST['is_broadcast'] ?? 0;

if ($group_id > 0 && $admin_id > 0) {
    
    // 1. Security Check: Verify this user is actually an admin of this specific group
    $check_admin = $conn->prepare("SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'admin'");
    $check_admin->bind_param("ii", $group_id, $admin_id);
    $check_admin->execute();
    $result = $check_admin->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Unauthorized. Only group admins can update settings."]);
        exit;
    }

    // 2. Update the group settings
    $update = $conn->prepare("UPDATE `groups` SET group_name = ?, is_broadcast = ? WHERE id = ?");
    $update->bind_param("sii", $name, $is_broadcast, $group_id);
    
    if ($update->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing required data"]);
}
?>