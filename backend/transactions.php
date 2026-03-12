<?php
require_once 'config.php'; // เชื่อมต่อกับไฟล์ config.php

function getUserFromToken() {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
    $decoded = base64_decode(substr($auth, 7));
    $parts   = explode('|', $decoded);

    // format: user_id | email | timestamp
    return [
        'user_id' => (int)($parts[0] ?? 0),
        'email'   => $parts[1] ?? '',
    ];
}

function calcBalance($db, $user_id) {
    $stmt = $db->prepare("SELECT * FROM transactions WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $rows    = $stmt->fetchAll();
    $balance = 1000000;
    foreach ($rows as $tx) {
        $balance += $tx['type'] === 'ฝาก' ? $tx['amount'] : -$tx['amount'];
    }
    return $balance;
}

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// GET ดึงรายการเฉพาะของ user นี้
if ($method === 'GET') {
    $user = getUserFromToken();

    $stmt = $db->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user['user_id']]);
    $rows = $stmt->fetchAll();

    $balance = 1000000;
    foreach ($rows as $tx) {
        $balance += $tx['type'] === 'ฝาก' ? $tx['amount'] : -$tx['amount'];
    }

    echo json_encode([
        'success'      => true,
        'transactions' => $rows,
        'balance'      => $balance,
    ]);
}

// POST เพิ่มรายการ ฝาก ถอน และตรวจสอบยอดเงินพอถอนไหมก่อนบันทึก (เฉพาะในแต่ละ user )
elseif ($method === 'POST') {
    $user   = getUserFromToken();
    $body   = json_decode(file_get_contents('php://input'), true);
    $amount = (float)($body['amount'] ?? 0);
    $type   = $body['type'] ?? '';

    if ($amount <= 0 || $amount > 100000) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'จำนวนเงินต้องอยู่ระหว่าง 1 - 100,000 บาท']);
        exit();
    }
    if (!in_array($type, ['ฝาก', 'ถอน'])) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'ประเภทไม่ถูกต้อง']);
        exit();
    }

    // เช็คยอดเงินพอถอนไหม
    if ($type === 'ถอน') {
        $balance = calcBalance($db, $user['user_id']);
        if ($amount > $balance) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'ยอดเงินไม่เพียงพอ']);
            exit();
        }
    }
// บันทึกลง database
    $datetime = date('d/m/Y H:i:s');
    $db->prepare("INSERT INTO transactions (user_id, email, amount, type, datetime) VALUES (?, ?, ?, ?, ?)")
       ->execute([$user['user_id'], $user['email'], $amount, $type, $datetime]);
    $id = $db->lastInsertId();

    $balance = calcBalance($db, $user['user_id']);

    echo json_encode([
        'success'     => true,
        'transaction' => [
            'id'       => $id,
            'user_id'  => $user['user_id'],
            'email'    => $user['email'],
            'amount'   => $amount,
            'type'     => $type,
            'datetime' => $datetime,
        ],
        'balance' => $balance,
    ]);
}

// PUT แก้ไขรายการ (เฉพาะในแต่ละ user)
elseif ($method === 'PUT') {
    $user   = getUserFromToken();
    $body   = json_decode(file_get_contents('php://input'), true);
    $id     = (int)($_GET['id'] ?? 0);
    $amount = (float)($body['amount'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ไม่พบรายการ']);
        exit();
    }
    if ($amount <= 0 || $amount > 100000) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'จำนวนเงินต้องอยู่ระหว่าง 1 - 100,000 บาท']);
        exit();
    }

    // ตรวจว่า transaction นี้เป็นของ user นี้จริงไหม
    $stmt = $db->prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user['user_id']]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'ไม่มีสิทธิ์แก้ไขรายการนี้']);
        exit();
    }

    $db->prepare("UPDATE transactions SET amount = ? WHERE id = ? AND user_id = ?")
       ->execute([$amount, $id, $user['user_id']]);

    $balance = calcBalance($db, $user['user_id']);
    echo json_encode(['success' => true, 'balance' => $balance]);
}

// DELETE ลบรายการ (เฉพาะในแต่ละ user)
elseif ($method === 'DELETE') {
    $user = getUserFromToken();
    $id   = (int)($_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ไม่พบรายการ']);
        exit();
    }

    // ตรวจว่า transaction นี้เป็นของ user นี้จริงไหม
    $stmt = $db->prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user['user_id']]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'ไม่มีสิทธิ์ลบรายการนี้']);
        exit();
    }

    $db->prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?")
       ->execute([$id, $user['user_id']]);

    $balance = calcBalance($db, $user['user_id']);
    echo json_encode(['success' => true, 'balance' => $balance]);
}

else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}