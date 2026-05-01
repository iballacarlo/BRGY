<?php
$cfg = require __DIR__ . '/config.php';

try {
    $dsn = "mysql:host=".$cfg['db_host'].";dbname=".$cfg['db_name'].";charset=utf8mb4";
    $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Database connection failed: '.$e->getMessage()]);
    exit;
}

function json($data){
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}
