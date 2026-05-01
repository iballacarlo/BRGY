<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>PHP Test</h1>";
echo "Loaded php.ini: " . php_ini_loaded_file() . "<br>";
echo phpinfo();
echo "<hr>";
echo "Extensions loaded: ";
echo extension_loaded('pdo_mysql') ? "✓ pdo_mysql" : "✗ pdo_mysql";
echo " | ";
echo extension_loaded('mysqli') ? "✓ mysqli" : "✗ mysqli";
echo "<br>";

$cfg = require __DIR__ . '/config.php';
echo "Config loaded: " . json_encode($cfg) . "<br>";

try {
    $dsn = "mysql:host=" . $cfg['db_host'] . ";dbname=" . $cfg['db_name'] . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass']);
    echo "✓ Database connected successfully!<br>";
    
    $stmt = $pdo->query("SELECT 1");
    echo "✓ Query executed!<br>";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "<br>";
}
?>
