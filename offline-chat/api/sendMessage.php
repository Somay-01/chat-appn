<?php
include("../config/db.php");

$sender_id = $_POST['sender_id'] ?? 0;
$receiver_id = $_POST['receiver_id'] ?? 0;
$group_id = $_POST['group_id'] ?? 0;
$reply_to = $_POST['reply_to'] ?? 0; 
$message = $_POST['message'] ?? '';

// File Upload Logic
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../uploads/'; 
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
    
    $original_file_name = $_FILES['file']['name'];
    $file_extension = strtolower(pathinfo($original_file_name, PATHINFO_EXTENSION));
    
    // 1. SECURITY WHITELIST: Only allow specific office files and images
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt', 'zip', 'xlsx'];
    
    if (!in_array($file_extension, $allowed_extensions)) {
        echo json_encode(["status" => "error", "message" => "File type not allowed for security reasons."]);
        exit;
    }

    // 2. UX TWEAK: Clean the filename so React can read it perfectly
    // We replace spaces and existing underscores with hyphens
    $clean_name = preg_replace('/[\s_]+/', '-', basename($original_file_name));
    
    // Append exactly ONE underscore after the timestamp. 
    // This makes your React `split('_').pop()` code extract the exact original filename!
    $unique_file_name = time() . '_' . $clean_name;

    if (move_uploaded_file($_FILES['file']['tmp_name'], $upload_dir . $unique_file_name)) {
        $file_tag = "[ATTACHMENT]:" . $unique_file_name;
        $message = empty($message) ? $file_tag : $message . " " . $file_tag;
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to move uploaded file."]);
        exit;
    }
}

if ($sender_id > 0 && !empty($message)) {
    if ($group_id > 0) {
        $sql = "INSERT INTO messages (sender_id, receiver_id, group_id, message, reply_to, created_at) VALUES (?, 0, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iisi", $sender_id, $group_id, $message, $reply_to);
    } else {
        $sql = "INSERT INTO messages (sender_id, receiver_id, group_id, message, reply_to, created_at) VALUES (?, ?, 0, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iisi", $sender_id, $receiver_id, $message, $reply_to);
    }
    
    if ($stmt && $stmt->execute()) {
        echo json_encode(["status" => "success", "message_id" => $conn->insert_id]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
?>