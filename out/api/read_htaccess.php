<?php
header('Content-Type: text/plain');
echo "ROOT DIR LIST:\n";
print_r(scandir('../'));

echo "\nROOT HTACCESS CONTENT:\n";
echo @file_get_contents('../.htaccess');

echo "\n\nUPLOADS HTACCESS CONTENT:\n";
echo @file_get_contents('../uploads/.htaccess');

echo "\n\nAPI HTACCESS CONTENT:\n";
echo @file_get_contents('./.htaccess');
?>
