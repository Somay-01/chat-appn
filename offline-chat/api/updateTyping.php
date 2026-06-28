<?php
include("../config/db.php");

$user_id = $_POST['user_id'] ?? 0;
$typing_to = $_POST['typing_to'] ?? 0; 

if ($user_id > 0) {
    $stmt = $conn->prepare("UPDATE users SET typing_to = ? WHERE id = ?");
    $stmt->bind_param("ii", $typing_to, $user_id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
}
?>