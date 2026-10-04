# Exporta cada slide de un .pptx de salida/ a PNG usando PowerPoint (QA visual).
# Uso: powershell -File render_any.ps1 -Deck presentacion_10min.pptx -Out render_10min
param([string]$Deck = "presentacion.pptx", [string]$Out = "render")
$pptx = (Resolve-Path "$PSScriptRoot\..\$Deck").Path
$Out = Join-Path $PSScriptRoot $Out
New-Item -ItemType Directory -Force $Out | Out-Null
Get-ChildItem $Out -Filter *.png | Remove-Item -Force
$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open($pptx, $true, $false, $false)
  $i = 1
  foreach ($s in $pres.Slides) {
    $s.Export((Join-Path $Out ("slide-{0:D2}.png" -f $i)), "PNG", 1600, 900)
    $i++
  }
  $pres.Close()
} finally {
  $app.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($app) | Out-Null
}
Get-ChildItem $Out -Filter *.png | ForEach-Object { $_.FullName }
