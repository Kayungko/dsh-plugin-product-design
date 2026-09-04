# install.ps1 — deploy dsh-plugin-product-design into the DSH desktop profile.
#
# Strategy: copy-based install into the hoisted profile node_modules (the same
# physical layout registry-installed bundles like @openviking/dsh-memory-plugin
# use). Avoids `pnpm install` entirely so the running profile's lockfile and
# market-managed versions stay untouched. A DSH Desktop restart loads the new
# bundle.
#
# Usage: pwsh install.ps1 [-Source <plugin dir>] [-Profile <profile dir>] [-Uninstall]

param(
  [string]$Source = $PSScriptRoot,
  [string]$Profile = (Join-Path $env:USERPROFILE '.dsh\profiles\desktop'),
  [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
# Never run with the target directory as cwd: Windows refuses to remove a
# directory that is some process's working directory.
Set-Location $PSScriptRoot
$PackageName = 'dsh-plugin-product-design'
$Target = Join-Path $Profile "node_modules\$PackageName"
$ManifestPath = Join-Path $Profile 'package.json'
$PackageMapPath = Join-Path $Profile "node_modules\.package-map.json"

function Read-Json([string]$path) {
  return (Get-Content $path -Raw) | ConvertFrom-Json -Depth 64
}

function Write-Json([string]$path, $obj) {
  $json = $obj | ConvertTo-Json -Depth 64
  Set-Content -Path $path -Value $json -Encoding utf8
}

# --- backups ----------------------------------------------------------------
$BackupDir = Join-Path $Source "backups\$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
Copy-Item $ManifestPath (Join-Path $BackupDir 'profile-package.json')
if (Test-Path $PackageMapPath) { Copy-Item $PackageMapPath (Join-Path $BackupDir 'package-map.json') }
Write-Host "backup -> $BackupDir"

$manifest = Read-Json $ManifestPath

if ($Uninstall) {
  # remove bundle entry
  $bundles = @($manifest.dsh.profile.bundles | Where-Object { $_ -ne $PackageName })
  $manifest.dsh.profile.bundles = $bundles
  if ($manifest.PSObject.Properties['dependencies'] -and $manifest.dependencies.PSObject.Properties[$PackageName]) {
    $manifest.dependencies.PSObject.Properties.Remove($PackageName)
  }
  Write-Json $ManifestPath $manifest
  if (Test-Path $Target) { Remove-Item $Target -Recurse -Force }
  Write-Host "uninstalled $PackageName (restart DSH Desktop to apply)"
  exit 0
}

# --- sanity checks -----------------------------------------------------------
if (-not (Test-Path (Join-Path $Source 'package.json'))) { throw "plugin source not found: $Source" }
if (-not (Test-Path $ManifestPath)) { throw "profile manifest not found: $ManifestPath" }

# --- copy plugin files (real directory, hoisted layout) ----------------------
# Overwrite in place instead of delete+recreate: removing the directory fails
# while it is any process's working directory, and file overwrites work even
# when the running host has the loaded modules in memory.
if (-not (Test-Path $Target)) { New-Item -ItemType Directory -Force -Path $Target | Out-Null }
$files = @('package.json', 'cordis.patch.yml', 'index.mjs', 'skills.mjs', 'README.md', 'LICENSE')
foreach ($file in $files) {
  $from = Join-Path $Source $file
  if (Test-Path $from) { Copy-Item $from (Join-Path $Target $file) -Force }
}
# bundled content directories (recursive)
$dirs = @('skills', 'references', 'scripts', 'templates')
foreach ($dir in $dirs) {
  $from = Join-Path $Source $dir
  if (Test-Path $from) { Copy-Item $from (Join-Path $Target $dir) -Recurse -Force }
}
Write-Host "copied plugin -> $Target"

# --- profile manifest: dependency specifier + bundle entry --------------------
if (-not $manifest.PSObject.Properties['dependencies']) {
  $manifest | Add-Member -NotePropertyName dependencies -NotePropertyValue ([PSCustomObject]@{})
}
$manifest.dependencies | Add-Member -NotePropertyName $PackageName -NotePropertyValue "file:$($Source -replace '\\', '/')" -Force
$bundles = @($manifest.dsh.profile.bundles)
if ($bundles -notcontains $PackageName) { $bundles += $PackageName }
$manifest.dsh.profile.bundles = $bundles
Write-Json $ManifestPath $manifest
Write-Host "profile manifest updated (dependencies + bundles)"

# --- pnpm bookkeeping (.package-map.json), additive only ----------------------
if (Test-Path $PackageMapPath) {
  $map = Read-Json $PackageMapPath
  if (-not $map.packages.PSObject.Properties[$PackageName]) {
    $entry = [PSCustomObject]@{
      url          = "./$PackageName"
      dependencies = [PSCustomObject]@{ $PackageName = $PackageName }
    }
    $map.packages | Add-Member -NotePropertyName $PackageName -NotePropertyValue $entry
    $root = $map.packages.'.'
    $root.dependencies | Add-Member -NotePropertyName $PackageName -NotePropertyValue $PackageName -Force
    Write-Json $PackageMapPath $map
    Write-Host '.package-map.json updated'
  }
}

Write-Host ''
Write-Host 'done. Restart DSH Desktop to load the new bundle.'
Write-Host 'After restart, every session catalog lists the pd-* skills; /pd-index is the router entry.'
