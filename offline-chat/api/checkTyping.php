<?php
header('Content-Type: application/json');
include("../config/db.php");

$my_id = $_GET['my_id'] ?? 0;
$active_user_id = $_GET['active_user_id'] ?? 0;

if ($my_id > 0 && $active_user_id > 0) {
    // Ensure 'typing_to' column exists in your users table
    $stmt = $conn->prepare("SELECT typing_to FROM users WHERE id = ?");
    $stmt->bind_param("i", $active_user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $is_typing = ($row['typing_to'] == $my_id);
        echo json_encode(["is_typing" => (bool)$is_typing]);
    } else {
        echo json_encode(["is_typing" => false]);
    }
} else {
    echo json_encode(["is_typing" => false]);
}
?>