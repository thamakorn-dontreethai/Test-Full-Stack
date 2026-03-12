<?php
require_once 'config.php'; // เชื่อมต่อกับไฟล์ config.php 

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$body     = json_decode(file_get_contents('php://input'), true);
$email    = trim($body['email'] ?? '');
$password = trim($body['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'รูปแบบอีเมลไม่ถูกต้อง']);
    exit();
}
if (empty($password)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกรหัสผ่าน']);
    exit();
}

$db = getDB();

// เช็คว่ามี user นี้ไหม
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    // ถ้ามีแล้วจะตรวจ password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'รหัสผ่านไม่ถูกต้อง']);
        exit();
    }
} else {
    // ถ้ายังไม่มี จะสามารถเข้าได้ และจะบันทึกรหัส ผ่านแบบ hash ลง database
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $db->prepare("INSERT INTO users (email, password) VALUES (?, ?)")
       ->execute([$email, $hashed]);
    $user = ['id' => $db->lastInsertId(), 'email' => $email];
}

// สร้าง token พร้อม user_id
$token = base64_encode($user['id'] . '|' . $email . '|' . time());

echo json_encode([
    'success' => true,
    'token'   => $token,
    'email'   => $email,
]);