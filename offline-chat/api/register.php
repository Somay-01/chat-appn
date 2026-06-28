<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include("../config/db.php");

// 1. Fetch POST variables
$name = $_POST['name'] ?? '';
$biometric_id = $_POST['biometric_id'] ?? '';
$designation = $_POST['designation'] ?? '';
$raw_password = $_POST['password'] ?? '';
$role = 'Member'; // Hardcoded for security
$gender = $_POST['gender'] ?? '';
$status = 'pending'; // Added to ensure Admin must approve

// 2. Validate required fields 
if (empty($name) || empty($biometric_id) || empty($designation) || empty($raw_password) || empty($gender)) {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit;
}

// 3. Hash the password 
$hashed_password = password_hash($raw_password, PASSWORD_DEFAULT);

// 4. Check if biometric_id already exists
$check_sql = "SELECT id FROM users WHERE biometric_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("s", $biometric_id);
$check_stmt->execute();
if ($check_stmt->get_result()->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "An account with this Biometric ID already exists"]);
    exit;
}

// 5. Insert user with 'status' column included
$insert_sql = "INSERT INTO users (name, biometric_id, password, role, designation, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
$insert_stmt = $conn->prepare($insert_sql);

// Bind 7 parameters: "sssssss"
$insert_stmt->bind_param("sssssss", $name, $biometric_id, $hashed_password, $role, $designation, $gender, $status);

if ($insert_stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Registration successful! Please wait for an Admin to approve your account."
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to create account: " . $conn->error]);
}
?>