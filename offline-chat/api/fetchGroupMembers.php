<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Content-Type: application/json");
error_reporting(0); // Prevents syntax/warning errors from breaking JSON output
include("../config/db.php");

$group_id = $_GET['group_id'] ?? 0;

if ($group_id > 0) {
    // We now fetch the user's ID, Name, and their Group Role
    $sql = "SELECT u.id, u.name, gm.role 
            FROM group_members gm 
            JOIN users u ON gm.user_id = u.id 
            WHERE gm.group_id = ?";
            
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param("i", $group_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $members = [];
        while ($row = $result->fetch_assoc()) {
            // We are sending the full object now (id, name, role), not just a string
            $members[] = $row; 
        }
        
        echo json_encode(["status" => "success", "members" => $members]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No group ID provided"]);
}
?>