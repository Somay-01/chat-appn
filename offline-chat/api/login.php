<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
error_reporting(0); // Prevents HTML warnings from breaking React's JSON parser
include("../config/db.php");

// We are now receiving 'identifier' which can be name or biometric_id
$identifier = $_POST['identifier'] ?? '';
$password = $_POST['password'] ?? '';

// Check if fields are empty
if (empty($identifier) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Name/Biometric ID and password are required"]);
    exit;
}

// Look up the user in the database by Name OR Biometric ID
$sql = "SELECT id, name, biometric_id, password, role, designation, gender, status FROM users WHERE name = ? OR biometric_id = ?";
$stmt = $conn->prepare($sql);

// CRITICAL FIX: Check if the statement prepared successfully
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]);
    exit;
}

$stmt->bind_param("ss", $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    
    // Check if they are approved BEFORE checking password
    if ($row['status'] === 'pending') {
        echo json_encode(["status" => "error", "message" => "Your account is still pending Admin approval."]);
        exit;
    }

    // Verify the password 
    if ($password === $row['password'] || password_verify($password, $row['password'])) {
        
        echo json_encode([
            "status" => "success",
            "user" => [
                "id" => $row['id'],
                "name" => $row['name'],
                "biometric_id" => $row['biometric_id'],
                "role" => $row['role'],
                "designation" => $row['designation'],
                "gender" => $row['gender'],
                "status" => $row['status']
            ]
        ]);
        
    } else {
        echo json_encode(["status" => "error", "message" => "Incorrect password"]);
    }
} else {
     echo json_encode(["status" => "error", "message" => "User not found"]);
}
?>