<?php
echo "Current Dir: " . getcwd() . "\n";
echo "Target Path: " . realpath('../uploads/') . "\n";
$png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
$res = file_put_contents('../uploads/test.png', $png);
echo "Result: " . ($res !== false ? "Success ($res bytes)" : "Failed") . "\n";
if (file_exists('../uploads/test.png')) {
    echo "File confirmed at " . realpath('../uploads/test.png') . "\n";
}
