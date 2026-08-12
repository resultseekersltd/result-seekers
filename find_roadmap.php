<?php

$file = __DIR__ . '/.claude-code-history/2026-08-10_105915_I\'m-uploading-6-documents-specifying-a-p_1945cf72.md';
$content = file_get_contents($file);

// Find where Task 010 or Contact Submission or Forms & UX is discussed
preg_match_all('/Task 010[^\n]*/i', $content, $m10);
echo "=== TASK 010 REFERENCES ===\n";
foreach (array_unique($m10[0]) as $l) {
    echo $l . "\n";
}

preg_match_all('/Task 011[^\n]*/i', $content, $m11);
echo "\n=== TASK 011 REFERENCES ===\n";
foreach (array_unique($m11[0]) as $l) {
    echo $l . "\n";
}
