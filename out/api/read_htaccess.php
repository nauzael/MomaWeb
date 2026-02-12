<?php
echo "ROOT HTACCESS:\n";
echo file_get_contents('../.htaccess');
echo "\n\nUPLOADS HTACCESS:\n";
echo file_get_contents('../uploads/.htaccess');
