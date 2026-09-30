$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$pidFile = Join-Path $root '.run/backend-processes.json'
if (-not (Test-Path -LiteralPath $pidFile)) { Write-Host 'No managed backend processes.'; return }
foreach ($record in (Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json)) {
    $proc = Get-Process -Id $record.Id -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -eq 'java' -and $proc.StartTime.ToUniversalTime().Ticks -eq ([datetime]$record.Started).ToUniversalTime().Ticks) {
        Stop-Process -Id $record.Id
        Write-Host "Stopped $($record.Name)"
    }
}
