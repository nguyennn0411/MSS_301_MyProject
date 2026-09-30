param([switch]$Build)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
if (-not $env:JAVA_HOME -or -not (Test-Path (Join-Path $env:JAVA_HOME 'bin/java.exe'))) { throw 'Set JAVA_HOME to JDK 21.' }
if ($Build) {
    & .\mvnw.cmd -B -ntp clean verify
    if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' }
}
$specs = @(
    @{ Name='discovery-server'; Path='discovery-server'; Port=8761 },
    @{ Name='user-service'; Path='services/user-service'; Port=8081 },
    @{ Name='court-service'; Path='services/court-service'; Port=8082 },
    @{ Name='booking-service'; Path='services/booking-service'; Port=8083 },
    @{ Name='api-gateway'; Path='api-gateway'; Port=8080 }
)
foreach ($spec in $specs) {
    if (Get-NetTCPConnection -State Listen -LocalPort $spec.Port -ErrorAction SilentlyContinue) { throw "Port $($spec.Port) is in use. Stop that service before starting." }
    $spec.Jar = Join-Path $root "$($spec.Path)/target/$($spec.Name)-0.0.1-SNAPSHOT.jar"
    if (-not (Test-Path -LiteralPath $spec.Jar)) { throw "Missing JAR. Run .\mvnw.cmd clean verify first." }
}
$runDir = Join-Path $root '.run'
New-Item -ItemType Directory -Force $runDir | Out-Null
$records = @()
try {
    foreach ($spec in $specs) {
        $proc = Start-Process -FilePath (Join-Path $env:JAVA_HOME 'bin/java.exe') -ArgumentList @('-Xmx256m','-jar',('"' + $spec.Jar + '"')) -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runDir "$($spec.Name).log") -RedirectStandardError (Join-Path $runDir "$($spec.Name).err.log") -PassThru
        $records += @{ Name=$spec.Name; Id=$proc.Id; Started=$proc.StartTime.ToUniversalTime().ToString('o') }
    }
    $records | ConvertTo-Json | Set-Content (Join-Path $runDir 'backend-processes.json')
    Write-Host 'Started backend processes. Waiting for Eureka and Gateway (up to 180 seconds)...'
    $deadline = (Get-Date).AddSeconds(180)
    do {
        try {
            foreach ($name in @('users','courts','bookings')) {
                $response = Invoke-RestMethod "http://localhost:8080/api/$name/status" -TimeoutSec 3
                if ($response.status -ne 'UP' -or $response.milestone -ne '2') { throw 'Not ready' }
            }
            Write-Host 'Backend ready: http://localhost:8080 | Eureka: http://localhost:8761'
            return
        } catch { Start-Sleep -Seconds 3 }
    } while ((Get-Date) -lt $deadline)
    throw 'Startup timed out. Inspect .run/*.log.'
} catch {
    foreach ($record in $records) {
        $proc = Get-Process -Id $record.Id -ErrorAction SilentlyContinue
        if ($proc -and $proc.StartTime.ToUniversalTime().ToString('o') -eq $record.Started) { Stop-Process -Id $record.Id }
    }
    throw
}
