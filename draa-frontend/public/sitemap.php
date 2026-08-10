<?php
header("Content-Type: application/xml; charset=utf-8");

// Dynamic sitemap URL from the API backend
$apiUrl = "https://api.myedudocs.in/sitemap.xml";

// Fetch the XML using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 12);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Avoid SSL mismatch blocks on some cPanel curl setups

$xml = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && !empty($xml)) {
    echo $xml;
} else {
    // Safe fallback XML if the backend database is unreachable during Google's crawl
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    echo '  <url>' . "\n";
    echo '    <loc>https://myedudocs.in</loc>' . "\n";
    echo '    <changefreq>daily</changefreq>' . "\n";
    echo '    <priority>1.0</priority>' . "\n";
    echo '  </url>' . "\n";
    echo '  <url>' . "\n";
    echo '    <loc>https://myedudocs.in/about</loc>' . "\n";
    echo '    <changefreq>weekly</changefreq>' . "\n";
    echo '    <priority>0.8</priority>' . "\n";
    echo '  </url>' . "\n";
    echo '  <url>' . "\n";
    echo '    <loc>https://myedudocs.in/courses</loc>' . "\n";
    echo '    <changefreq>weekly</changefreq>' . "\n";
    echo '    <priority>0.8</priority>' . "\n";
    echo '  </url>' . "\n";
    echo '</urlset>';
}
?>
