# Exporta cada slide de salida/presentacion.pptx a PNG usando PowerPoint (QA visual).
param([string]$Out = "$PSScriptRoot\render")
$pptx = (Resolve-Path "$PSScriptRoot\..\presentacion.pptx").Path
New-Item -ItemType Directory -Force $Out | Out-Null
Get-ChildItem $Out -Filter *.png | Remove-Item -Force
$app = New-Object -ComObject PowerPoint.Application
try {
  $pres = $app.Presentations.Open($pptx, $true, $false, $false)  # ReadOnly, Untitled=false, WithWindow=false
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
