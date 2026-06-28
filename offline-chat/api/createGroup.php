<?php
header("Content-Type: application/json");
error_reporting(0);
include("../config/db.php");

$group_name = $_POST['name'] ?? '';
$created_by = $_POST['created_by'] ?? 0;

// NEW: Convert to array, remove empty values, and strip all duplicates instantly
$raw_members = isset($_POST['members']) ? explode(',', $_POST['members']) : [];
$members = array_unique(array_filter($raw_members)); 

if (empty($group_name) || $created_by == 0 || empty($members)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// 1. Create the Group
$stmt = $conn->prepare("INSERT INTO `groups` (group_name, created_by) VALUES (?, ?)");
if ($stmt) {
    $stmt->bind_param("si", $group_name, $created_by);
    if ($stmt->execute()) {
        $group_id = $conn->insert_id;
        
        // 2. Automatically add the creator to the members list if not present
        if (!in_array($created_by, $members)) { 
            $members[] = $created_by; 
        }

       
        $member_stmt = $conn->prepare("INSERT IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)");
        foreach ($members as $user_id) {
            
            $role = ($user_id == $created_by) ? 'admin' : 'member';
            $member_stmt->bind_param("iis", $group_id, $user_id, $role);
            $member_stmt->execute();
        }
        
        echo json_encode(["status" => "success", "message" => "Group created", "group_id" => $group_id]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to create group"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Database error"]);
}
?>