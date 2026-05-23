$services = @('api-gateway', 'auth-service', 'admin-service', 'master-service', 'item-service')
$failed = @()

foreach ($s in $services) {
  Write-Host "Building $s..." -NoNewline
  $output = & npx nest build $s 2>&1 | Out-String
  if ($LASTEXITCODE -eq 0) {
    Write-Host " OK" -ForegroundColor Green
  } else {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host $output
    $failed += $s
  }
}

Write-Host ""
if ($failed.Count -eq 0) {
  Write-Host "All 5 services built successfully!" -ForegroundColor Green
} else {
  Write-Host "Failed: $($failed -join ', ')" -ForegroundColor Red
}
