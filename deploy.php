<?php
// GitHub Webhook Deploy Script for Microdose VR Manual with LFS Support
// Dual Security: GitHub signature + URL parameter secret

$webhookSecret = 'c8de2506292528427ace4582bcaba0258772b60fd9d688ef8b9728ef2168c026';
$urlSecret = '39b1ce6ddd72ab17f0f60be6f10d6ace79e4e2e4760e07f5d0568a3fa77ec85a2cf4e958387395c9';
$logFile = '/var/log/microdose-deploy.log';

// Log function
function logMessage($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

// First security layer: Check URL parameter secret
$providedSecret = $_GET['SECRET'] ?? '';
if (empty($providedSecret) || !hash_equals($urlSecret, $providedSecret)) {
    http_response_code(401);
    logMessage('ERROR: Invalid or missing URL secret parameter');
    exit('Unauthorized: Invalid URL secret');
}

// Second security layer: Verify GitHub signature
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$rawPayload = file_get_contents('php://input');

// Handle both JSON and form-encoded payloads
if (isset($_POST['payload'])) {
    // Form-encoded webhook
    $payload = $_POST['payload'];
    $verificationPayload = $rawPayload; // Use raw input for signature verification
} else {
    // JSON webhook
    $payload = $rawPayload;
    $verificationPayload = $rawPayload;
}

if (empty($signature)) {
    http_response_code(401);
    logMessage('ERROR: No GitHub signature provided');
    exit('Unauthorized: No GitHub signature');
}

$expectedSignature = 'sha256=' . hash_hmac('sha256', $verificationPayload, $webhookSecret);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(401);
    logMessage('ERROR: Invalid GitHub signature');
    exit('Unauthorized: Invalid GitHub signature');
}

// Parse the payload
$data = json_decode($payload, true);
if (!$data) {
    http_response_code(400);
    logMessage('ERROR: Invalid JSON payload - Raw payload: ' . substr($payload, 0, 200));
    exit('Bad Request: Invalid JSON');
}

// Handle GitHub ping event
if (isset($data['zen'])) {
    logMessage('INFO: GitHub ping event received - webhook configured successfully');
    http_response_code(200);
    exit('Pong! Webhook configured successfully.');
}

// Only deploy on push to master
if (!isset($data['ref']) || $data['ref'] !== 'refs/heads/master') {
    $ref = $data['ref'] ?? 'unknown';
    logMessage('INFO: Ignoring event - ref: ' . $ref);
    exit('Ignored: Not a push to master branch');
}

logMessage('INFO: Starting deployment for commit ' . substr($data['after'], 0, 7));

// Change to the repository directory
chdir('/var/www/phong.com/microdose');

// Stash any local changes
exec('git stash 2>&1', $stashOutput, $stashReturn);
if ($stashReturn !== 0) {
    logMessage('WARNING: Git stash failed: ' . implode(' ', $stashOutput));
}

// Pull the latest changes
exec('git pull origin master --force 2>&1', $pullOutput, $pullReturn);
if ($pullReturn !== 0) {
    http_response_code(500);
    logMessage('ERROR: Git pull failed: ' . implode(' ', $pullOutput));
    exit('Deployment failed: Git pull error');
}

// Pull LFS files (images)
exec('git lfs pull 2>&1', $lfsOutput, $lfsReturn);
if ($lfsReturn !== 0) {
    logMessage('WARNING: Git LFS pull failed: ' . implode(' ', $lfsOutput));
    // Don't fail deployment for LFS issues, just log the warning
}

// Set proper ownership
exec('chown -R www-data:www-data . 2>&1', $chownOutput, $chownReturn);
if ($chownReturn !== 0) {
    logMessage('WARNING: Chown failed: ' . implode(' ', $chownOutput));
}

// Log successful deployment
$commitMessage = $data['head_commit']['message'] ?? 'Unknown commit';
$committer = $data['head_commit']['committer']['name'] ?? 'Unknown';
logMessage("SUCCESS: Deployment completed. Commit: '$commitMessage' by $committer");

// Return success response
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Deployment completed successfully',
    'commit' => substr($data['after'], 0, 7),
    'timestamp' => date('Y-m-d H:i:s'),
    'lfs_status' => $lfsReturn === 0 ? 'success' : 'warning'
]);
?>

