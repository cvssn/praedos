# Renders praedos icon at multiple sizes via GDI+
# Outputs: icon.png (256), tray.png (32), icon.ico (multi-res via embedded PNGs)
Add-Type -AssemblyName System.Drawing

$outDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function New-Icon([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $s = $size / 256.0

    # Rounded background
    $r = [int](48 * $s)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $r*2, $r*2, 180, 90)
    $path.AddArc($size - $r*2 - 1, 0, $r*2, $r*2, 270, 90)
    $path.AddArc($size - $r*2 - 1, $size - $r*2 - 1, $r*2, $r*2, 0, 90)
    $path.AddArc(0, $size - $r*2 - 1, $r*2, $r*2, 90, 90)
    $path.CloseFigure()

    $bgColor = [System.Drawing.Color]::FromArgb(255, 7, 7, 10)
    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $g.FillPath($bgBrush, $path)
    $bgBrush.Dispose()

    # Inner gradient overlay for depth
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(28, 0, 224, 255),
        [System.Drawing.Color]::FromArgb(28, 111, 92, 255),
        45.0
    )
    $g.SetClip($path)
    $g.FillRectangle($grad, $rect)
    $g.ResetClip()
    $grad.Dispose()

    $cx = $size / 2.0
    $cy = $size / 2.0

    # Outer hex frame (dim)
    $hr1 = 100 * $s
    $pts1 = New-Object 'System.Drawing.PointF[]' 6
    for ($i = 0; $i -lt 6; $i++) {
        $a = [Math]::PI / 3 * $i - [Math]::PI / 2
        $pts1[$i] = New-Object System.Drawing.PointF(($cx + $hr1 * [Math]::Cos($a)), ($cy + $hr1 * [Math]::Sin($a)))
    }
    $dimPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 33, 36, 47), [Math]::Max(1.0, 2 * $s))
    $g.DrawPolygon($dimPen, $pts1)
    $dimPen.Dispose()

    # Inner hex frame (accent)
    $hr2 = 88 * $s
    $pts2 = New-Object 'System.Drawing.PointF[]' 6
    for ($i = 0; $i -lt 6; $i++) {
        $a = [Math]::PI / 3 * $i - [Math]::PI / 2
        $pts2[$i] = New-Object System.Drawing.PointF(($cx + $hr2 * [Math]::Cos($a)), ($cy + $hr2 * [Math]::Sin($a)))
    }
    $accent = [System.Drawing.Color]::FromArgb(220, 0, 224, 255)
    $accentPen = New-Object System.Drawing.Pen($accent, [Math]::Max(1.0, 3 * $s))
    $g.DrawPolygon($accentPen, $pts2)
    $accentPen.Dispose()

    # Stylized lowercase "p" mark
    $strokeW = [Math]::Max(2.0, 14 * $s)
    $pPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 0, 224, 255), $strokeW)
    $pPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    # Vertical stem
    $x = 96 * $s
    $yTop = 76 * $s
    $yBot = 196 * $s
    $g.DrawLine($pPen, $x, $yTop, $x, $yBot)

    # Bowl: closed loop on top — line top + arc + line back
    $bowlPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $bowlPath.AddLine($x, $yTop, 150 * $s, $yTop)
    $bowlPath.AddArc(114 * $s, $yTop, 76 * $s, 76 * $s, 270, 180)
    $bowlPath.AddLine(150 * $s, 152 * $s, $x, 152 * $s)
    $g.DrawPath($pPen, $bowlPath)
    $bowlPath.Dispose()
    $pPen.Dispose()

    # Center dot
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 224, 255))
    $dr = [Math]::Max(1.0, 2 * $s)
    $g.FillEllipse($dotBrush, $cx - $dr, $cy - $dr, $dr * 2, $dr * 2)
    $dotBrush.Dispose()

    $g.Dispose()
    return $bmp
}

# Generate primary PNGs
$sizes = @(16, 24, 32, 48, 64, 128, 256)
$pngs = @{}
foreach ($sz in $sizes) {
    $bmp = New-Icon -size $sz
    $pngPath = Join-Path $outDir ("icon-{0}.png" -f $sz)
    $bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngs[$sz] = $pngPath
    $bmp.Dispose()
}

# Canonical icon.png (256) and tray.png (32)
Copy-Item -Force $pngs[256] (Join-Path $outDir 'icon.png')
Copy-Item -Force $pngs[32]  (Join-Path $outDir 'tray.png')

# Build multi-res ICO with embedded PNGs
$icoSizes = @(16, 24, 32, 48, 64, 128, 256)
$icoPath = Join-Path $outDir 'icon.ico'
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter($fs)
try {
    # ICONDIR
    $bw.Write([uint16]0)              # reserved
    $bw.Write([uint16]1)              # type 1 = icon
    $bw.Write([uint16]$icoSizes.Count)

    $headerSize = 6 + (16 * $icoSizes.Count)
    $offsets = @()
    $datas = @()
    $offset = $headerSize

    foreach ($sz in $icoSizes) {
        $data = [System.IO.File]::ReadAllBytes($pngs[$sz])
        $datas += ,$data
        $offsets += $offset
        $offset += $data.Length
    }

    for ($i = 0; $i -lt $icoSizes.Count; $i++) {
        $sz = $icoSizes[$i]
        $w = if ($sz -ge 256) { 0 } else { $sz }
        $h = if ($sz -ge 256) { 0 } else { $sz }
        $bw.Write([byte]$w)            # width (0 = 256)
        $bw.Write([byte]$h)            # height
        $bw.Write([byte]0)             # colors
        $bw.Write([byte]0)             # reserved
        $bw.Write([uint16]1)           # planes
        $bw.Write([uint16]32)          # bpp
        $bw.Write([uint32]$datas[$i].Length)
        $bw.Write([uint32]$offsets[$i])
    }

    foreach ($d in $datas) {
        $bw.Write($d)
    }
}
finally {
    $bw.Dispose()
    $fs.Dispose()
}

# Cleanup intermediates
foreach ($sz in $sizes) {
    if ($sz -ne 256 -and $sz -ne 32) {
        Remove-Item -Force $pngs[$sz]
    }
}
Remove-Item -Force $pngs[256]
Remove-Item -Force $pngs[32]
# Wait — icon.png and tray.png are copies; intermediates already deleted.

Write-Host "Icons generated:"
Get-ChildItem $outDir -File | ForEach-Object { Write-Host (" - " + $_.Name + " (" + $_.Length + " bytes)") }
