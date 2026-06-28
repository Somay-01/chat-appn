<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");
error_reporting(0);
include("../config/db.php");

$group_id = $_POST['group_id'] ?? 0;
$admin_id = $_POST['admin_id'] ?? 0;
$target_user_id = $_POST['target_user_id'] ?? 0;
$action = $_POST['action'] ?? ''; // Accepts 'add' or 'kick'

if ($group_id == 0 || $admin_id == 0 || $target_user_id == 0 || empty($action)) {
    echo json_encode(["status" => "error", "message" => "Missing fields"]);
    exit;
}

// 1. SECURITY GATEKEEPER: Verify the person making the request is an ADMIN
$check_admin = "SELECT role FROM group_members WHERE group_id = ? AND user_id = ?";
$stmt = $conn->prepare($check_admin);
$stmt->bind_param("ii", $group_id, $admin_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();

if (!$res || $res['role'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Unauthorized. You are not an admin of this group."]);
    exit;
}

// 2. Perform the Action
if ($action === 'add') {
    // Add user as a standard member
    $insert = $conn->prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')");
    $insert->bind_param("ii", $group_id, $target_user_id);
    if ($insert->execute()) {
        echo json_encode(["status" => "success", "message" => "User added to group"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Could not add user"]);
    }
} else if ($action === 'kick') {
    // Prevent admin from accidentally kicking themselves through this route
    if ($admin_id == $target_user_id) {
         echo json_encode(["status" => "error", "message" => "You cannot kick yourself."]);
         exit;
    }
    $delete = $conn->prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?");
    $delete->bind_param("ii", $group_id, $target_user_id);
    if ($delete->execute()) {
        echo json_encode(["status" => "success", "message" => "User kicked from group"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Could not kick user"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
}
?>