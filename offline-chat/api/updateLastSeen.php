<?php
header("Access-Control-Allow-Origin: *");
include("../config/db.php");

$user_id = $_POST['user_id'] ?? 0;

if ($user_id > 0) {
    $query = "UPDATE users SET last_seen = NOW() WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    // Check if the query preparation failed (e.g., missing column)
    if ($stmt === false) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit;
    }
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    echo json_encode(["status" => "success"]);
}
?>