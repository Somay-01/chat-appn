<?php
header("Content-Type: application/json");
include("../config/db.php");

$group_id = $_POST['group_id'];
$admin_id = $_POST['admin_id'];
$target_id = $_POST['target_id'];
$role = $_POST['role']; // 'admin' or 'member'

// Security: Verify requester is admin
$check = $conn->prepare("SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'admin'");
$check->bind_param("ii", $group_id, $admin_id);
$check->execute();
if ($check->get_result()->num_rows == 0) { echo json_encode(["status" => "error"]); exit; }

$stmt = $conn->prepare("UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?");
$stmt->bind_param("sii", $role, $group_id, $target_id);
$stmt->execute();
echo json_encode(["status" => "success"]);
?>