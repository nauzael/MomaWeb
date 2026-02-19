<?php
header('Content-Type: application/json');

$password = 'Matrix17';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo json_encode([
    'password' => $password,
    'hash' => $hash,
    'verify' => password_verify($password, $hash)
]);
?>
