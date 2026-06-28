<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
error_reporting(0);
include("../config/db.php");

$user_id = $_GET['user_id'] ?? 0;

if ($user_id == 0) {
    echo json_encode([]);
    exit;
}

// 1. UPDATED GATEKEEPER: Now checks 'status' instead of 'is_active'
$check_user = "SELECT status FROM users WHERE id = ?";
$chk_stmt = $conn->prepare($check_user);
if ($chk_stmt) {
    $chk_stmt->bind_param("i", $user_id);
    $chk_stmt->execute();
    $user_res = $chk_stmt->get_result()->fetch_assoc();
    
    // Only allow if status is 'approved'
    if (!$user_res || $user_res['status'] !== 'approved') {
        echo json_encode([]);
        exit;
    }
} else {
    echo json_encode([]);
    exit;
}

// 2. Fetch groups
// FIX: Added g.is_broadcast to the SELECT query here
$sql = "SELECT g.id, g.group_name, g.is_broadcast, g.created_at 
        FROM `groups` g 
        JOIN group_members gm ON g.id = gm.group_id 
        WHERE gm.user_id = ?";

$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $groups = [];
    while ($row = $result->fetch_assoc()) {
        // Force the output to be an integer (0 or 1) so React understands it
        $row['is_broadcast'] = isset($row['is_broadcast']) ? (int)$row['is_broadcast'] : 0;
        $groups[] = $row;
    }
    
    echo json_encode($groups);
} else {
    echo json_encode([]);
}
?>