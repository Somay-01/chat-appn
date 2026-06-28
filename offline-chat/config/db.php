<?php


// 1. CORS HEADERS: Allow react dev server to talk to PHP
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// 2. PREFLIGHT CHECK: Handle the OPTIONS request browsers send before a POST
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 3. DATABASE CONNECTION

$conn = mysqli_connect("localhost", "root", "", "chat_app");

if (!$conn) {
    // error debugging
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . mysqli_connect_error()
    ]));
}
mysqli_set_charset($conn, "utf8mb4");
?>
