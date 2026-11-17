# Baixa, recorta, identifica em PT-BR e incorpora as fotografias ao projeto.
# Compatível com Windows PowerShell 5.1 e PowerShell 7 no Windows.
$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$PhotoDir = Join-Path $ProjectRoot 'assets\fotos'
$TempDir = Join-Path $ProjectRoot '.imagens-originais-temporarias'
New-Item -ItemType Directory -Force -Path $PhotoDir, $TempDir | Out-Null

Add-Type -AssemblyName System.Drawing

function Test-ValidImage {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $false }
    if ((Get-Item -LiteralPath $Path).Length -lt 12000) { return $false }
    $image = $null
    try {
        $image = [System.Drawing.Image]::FromFile($Path)
        return ($image.Width -gt 0 -and $image.Height -gt 0)
    } catch {
        return $false
    } finally {
        if ($null -ne $image) { $image.Dispose() }
    }
}

function Get-RemoteImage {
    param([string]$Url, [string]$OutFile)

    # Retoma downloads anteriores: não consulta novamente arquivos já válidos.
    if (Test-ValidImage -Path $OutFile) {
        Write-Host "Ja baixada; reutilizando: $([IO.Path]::GetFileName($OutFile))" -ForegroundColor DarkGreen
        return
    }

    if (Test-Path -LiteralPath $OutFile) { Remove-Item -LiteralPath $OutFile -Force }
    $downloadTemp = $OutFile + '.download'
    if (Test-Path -LiteralPath $downloadTemp) { Remove-Item -LiteralPath $downloadTemp -Force }

    Write-Host "Baixando: $([IO.Path]::GetFileName($OutFile))" -ForegroundColor Cyan
    $maxAttempts = 6
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        try {
            Invoke-WebRequest -Uri $Url -OutFile $downloadTemp -UseBasicParsing -TimeoutSec 90 -Headers @{
                'User-Agent' = 'LaringeEVoz-GrauTecnico/5.1 (projeto educacional; download de imagens para material didatico)'
                'Accept' = 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
            }

            if (-not (Test-ValidImage -Path $downloadTemp)) {
                throw 'O servidor nao entregou um arquivo de imagem valido.'
            }

            Move-Item -LiteralPath $downloadTemp -Destination $OutFile -Force
            # Pequeno intervalo entre requisicoes para nao sobrecarregar o Commons.
            Start-Sleep -Seconds 4
            return
        } catch {
            $message = $_.Exception.Message
            $statusCode = 0
            $retryAfter = $null
            try {
                $response = $_.Exception.Response
                if ($null -ne $response) {
                    $statusCode = [int]$response.StatusCode
                    $retryHeader = $response.Headers['Retry-After']
                    if ($retryHeader) {
                        $seconds = 0
                        if ([int]::TryParse([string]$retryHeader, [ref]$seconds)) {
                            $retryAfter = [Math]::Max(5, [Math]::Min(300, $seconds))
                        } else {
                            $retryDate = [DateTimeOffset]::MinValue
                            if ([DateTimeOffset]::TryParse([string]$retryHeader, [ref]$retryDate)) {
                                $retryAfter = [Math]::Max(5, [Math]::Min(300, [int][Math]::Ceiling(($retryDate - [DateTimeOffset]::UtcNow).TotalSeconds)))
                            }
                        }
                    }
                }
            } catch { }

            if (Test-Path -LiteralPath $downloadTemp) { Remove-Item -LiteralPath $downloadTemp -Force }
            if ($attempt -ge $maxAttempts) {
                throw "Falha ao baixar $Url apos $maxAttempts tentativas. Ultimo erro: $message"
            }

            if ($statusCode -eq 429) {
                if ($null -ne $retryAfter) {
                    $waitSeconds = [int]$retryAfter
                } else {
                    $waitSeconds = [Math]::Min(240, [int](30 * [Math]::Pow(2, ($attempt - 1))))
                }
                Write-Warning "Wikimedia limitou temporariamente os downloads (HTTP 429). Nova tentativa em $waitSeconds segundos."
            } elseif ($statusCode -eq 0 -or $statusCode -ge 500) {
                $waitSeconds = [Math]::Min(90, (5 * $attempt))
                Write-Warning "Falha temporaria de rede/servidor. Nova tentativa em $waitSeconds segundos."
            } else {
                throw "Falha HTTP $statusCode ao baixar $Url : $message"
            }
            Start-Sleep -Seconds $waitSeconds
        }
    }
}

function New-CroppedImage {
    param(
        [string]$Source,
        [string]$Destination,
        [int]$X, [int]$Y, [int]$Width, [int]$Height
    )
    $sourceBitmap = [System.Drawing.Bitmap]::new($Source)
    try {
        if (($X + $Width) -gt $sourceBitmap.Width -or ($Y + $Height) -gt $sourceBitmap.Height) {
            throw "Recorte fora dos limites: $Source ($($sourceBitmap.Width)x$($sourceBitmap.Height))."
        }
        $rect = [System.Drawing.Rectangle]::new($X, $Y, $Width, $Height)
        $crop = $sourceBitmap.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        try { $crop.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Jpeg) }
        finally { $crop.Dispose() }
    } finally { $sourceBitmap.Dispose() }
}

function Add-PhotoLabel {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle
    )
    $tempOutput = $Path + '.tmp.jpg'
    $bitmap = [System.Drawing.Bitmap]::new($Path)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        $panelHeight = [Math]::Max(66, [int]($bitmap.Height * 0.22))
        $top = $bitmap.Height - $panelHeight
        $panel = [System.Drawing.Rectangle]::new(0, $top, $bitmap.Width, $panelHeight)
        $background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(226, 21, 95, 56))
        $yellow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 254, 192, 0))
        $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
        try {
            $graphics.FillRectangle($background, $panel)
            $graphics.FillRectangle($yellow, 0, $top, [Math]::Max(6, [int]($bitmap.Width * 0.012)), $panelHeight)
            $titleSize = [Math]::Max(12, [Math]::Min(25, [int]($bitmap.Width / 38)))
            $subSize = [Math]::Max(9, [Math]::Min(15, [int]($bitmap.Width / 64)))
            $titleFont = [System.Drawing.Font]::new('Arial', [single]$titleSize, [System.Drawing.FontStyle]::Bold)
            $subFont = [System.Drawing.Font]::new('Arial', [single]$subSize, [System.Drawing.FontStyle]::Regular)
            try {
                $left = [single]([Math]::Max(14, [int]($bitmap.Width * 0.035)))
                $graphics.DrawString($Title, $titleFont, $white, $left, [single]($top + 9))
                $graphics.DrawString($Subtitle, $subFont, $yellow, $left, [single]($top + 12 + $titleSize + 4))
            } finally { $titleFont.Dispose(); $subFont.Dispose() }
        } finally { $background.Dispose(); $yellow.Dispose(); $white.Dispose() }
        $bitmap.Save($tempOutput, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
    Move-Item -LiteralPath $tempOutput -Destination $Path -Force
}

function Add-TranslatedLabels {
    param(
        [string]$Path,
        [array]$Labels
    )
    $tempOutput = $Path + '.tmp.jpg'
    $bitmap = [System.Drawing.Bitmap]::new($Path)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        foreach ($label in $Labels) {
            $x = [int]$label.X; $y = [int]$label.Y
            $w = [int]$label.Width; $h = [int]$label.Height
            $box = [System.Drawing.Rectangle]::new($x, $y, $w, $h)
            $background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(242, 21, 95, 56))
            $yellow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 254, 192, 0))
            $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
            $font = [System.Drawing.Font]::new('Arial', [single]$label.FontSize, [System.Drawing.FontStyle]::Bold)
            $format = [System.Drawing.StringFormat]::new()
            $format.Alignment = [System.Drawing.StringAlignment]::Near
            $format.LineAlignment = [System.Drawing.StringAlignment]::Center
            $format.Trimming = [System.Drawing.StringTrimming]::Word
            try {
                $graphics.FillRectangle($background, $box)
                $graphics.FillRectangle($yellow, $x, $y, 5, $h)
                $textRect = [System.Drawing.RectangleF]::new([single]($x + 12), [single]($y + 3), [single]($w - 18), [single]($h - 6))
                $graphics.DrawString([string]$label.Text, $font, $white, $textRect, $format)
            } finally {
                $background.Dispose(); $yellow.Dispose(); $white.Dispose(); $font.Dispose(); $format.Dispose()
            }
        }
        $bitmap.Save($tempOutput, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
    Move-Item -LiteralPath $tempOutput -Destination $Path -Force
}

function Add-PhotoLegend {
    param(
        [string]$Path,
        [string]$Title,
        [array]$Items
    )
    $tempOutput = $Path + '.tmp.jpg'
    $bitmap = [System.Drawing.Bitmap]::new($Path)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        $panelHeight = [Math]::Min(178, [int]($bitmap.Height * 0.30))
        $top = $bitmap.Height - $panelHeight
        $panel = [System.Drawing.Rectangle]::new(0, $top, $bitmap.Width, $panelHeight)
        $background = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(244, 21, 95, 56))
        $yellow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 254, 192, 0))
        $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
        $titleFont = [System.Drawing.Font]::new('Arial', [single]16, [System.Drawing.FontStyle]::Bold)
        $itemFont = [System.Drawing.Font]::new('Arial', [single]11, [System.Drawing.FontStyle]::Regular)
        $numberFont = [System.Drawing.Font]::new('Arial', [single]11, [System.Drawing.FontStyle]::Bold)
        try {
            $graphics.FillRectangle($background, $panel)
            $graphics.FillRectangle($yellow, 0, $top, 7, $panelHeight)
            $graphics.DrawString($Title, $titleFont, $white, [single]18, [single]($top + 8))
            for ($i = 0; $i -lt $Items.Count; $i++) {
                $column = $i % 3
                $row = [Math]::Floor($i / 3)
                $x = 20 + ($column * [int]($bitmap.Width / 3))
                $y = $top + 42 + ($row * 37)
                $graphics.DrawString(([string]$Items[$i].Number + '.'), $numberFont, $yellow, [single]$x, [single]$y)
                $graphics.DrawString([string]$Items[$i].Text, $itemFont, $white, [single]($x + 20), [single]$y)
            }
        } finally {
            $background.Dispose(); $yellow.Dispose(); $white.Dispose()
            $titleFont.Dispose(); $itemFont.Dispose(); $numberFont.Dispose()
        }
        $bitmap.Save($tempOutput, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
    Move-Item -LiteralPath $tempOutput -Destination $Path -Force
}

# Fontes originais verificadas nas páginas de arquivo do Wikimedia Commons.
$source = [ordered]@{
    endolarynx = 'https://upload.wikimedia.org/wikipedia/commons/d/de/Endolarynx.jpg'
    cutB = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Human_larynx_cut_section_2.jpg'
    xray = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Ausgepraegte_Verkalkungen_des_Schildknorpels_im_Roentgenbild.jpg'
    normal = 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Larynx_normal.jpg'
    positions = 'https://upload.wikimedia.org/wikipedia/commons/7/77/Vocal_cord_positions.png'
    lesions = 'https://upload.wikimedia.org/wikipedia/commons/1/14/Vocal_Folds.jpg'
    laryngitis = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Larynx_endo_3.jpg'
    reinke = 'https://upload.wikimedia.org/wikipedia/commons/2/29/Reinke-Oedem.jpg'
    epiglottitis = 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Epiglottitis_endoscopy.jpg'
}

$downloaded = @{}
$downloadFailures = @()
foreach ($key in $source.Keys) {
    $extension = if ($key -eq 'positions') { '.png' } else { '.jpg' }
    $file = Join-Path $TempDir ($key + $extension)
    try {
        Get-RemoteImage -Url $source[$key] -OutFile $file
        if (Test-ValidImage -Path $file) {
            $downloaded[$key] = $file
        } else {
            $downloadFailures += "$key ($($source[$key]))"
        }
    } catch {
        Write-Warning $_.Exception.Message
        $downloadFailures += "$key ($($source[$key]))"
    }
}
if ($downloadFailures.Count -gt 0) {
    throw "Ainda faltam $($downloadFailures.Count) imagem(ns): $($downloadFailures -join '; '). Os arquivos ja baixados foram preservados. Execute o BAT novamente mais tarde; ele continuara de onde parou."
}

# As peças de dissecção são mantidas em alta resolução; as identificações em inglês
# são cobertas e substituídas por rótulos em português nos mesmos pontos da fotografia.
Copy-Item $downloaded.endolarynx (Join-Path $PhotoDir 'laringe-vista-posterior.jpg') -Force
Copy-Item $downloaded.cutB (Join-Path $PhotoDir 'laringe-peca-disecada.jpg') -Force

# Recorta somente as fotografias endoscópicas da coluna direita da composição original,
# eliminando desenhos e identificações em inglês. Os rótulos são gravados em PT-BR.
New-CroppedImage -Source $downloaded.positions -Destination (Join-Path $PhotoDir 'pregas-inspiracao.jpg') -X 1220 -Y 15 -Width 340 -Height 345
New-CroppedImage -Source $downloaded.positions -Destination (Join-Path $PhotoDir 'pregas-fonacao.jpg') -X 1220 -Y 770 -Width 340 -Height 360

# Copia os registros clínicos e radiográficos para nomes locais estáveis.
Copy-Item $downloaded.xray (Join-Path $PhotoDir 'radiografia-ossificacao-laringea.jpg') -Force
Copy-Item $downloaded.normal (Join-Path $PhotoDir 'laringoscopia-normal.jpg') -Force
Copy-Item $downloaded.lesions (Join-Path $PhotoDir 'lesoes-pregas-vocais.jpg') -Force
Copy-Item $downloaded.laryngitis (Join-Path $PhotoDir 'laringite.jpg') -Force
Copy-Item $downloaded.reinke (Join-Path $PhotoDir 'edema-reinke.jpg') -Force
Copy-Item $downloaded.epiglottitis (Join-Path $PhotoDir 'epiglotite.jpg') -Force

# Grava os títulos e as legendas diretamente nos arquivos de imagem, em português brasileiro.
Add-TranslatedLabels (Join-Path $PhotoDir 'laringe-vista-posterior.jpg') @(
    @{ X=760; Y=160; Width=190; Height=48; FontSize=15; Text='VESTÍBULO DA LARINGE' },
    @{ X=755; Y=225; Width=200; Height=68; FontSize=14; Text='PREGA VESTIBULAR' },
    @{ X=785; Y=310; Width=165; Height=55; FontSize=14; Text='PREGA VOCAL' },
    @{ X=155; Y=270; Width=185; Height=55; FontSize=13; Text='INTERIOR DA LARINGE' },
    @{ X=15; Y=500; Width=175; Height=78; FontSize=13; Text='CARTILAGEM CRICÓIDEA' },
    @{ X=40; Y=635; Width=135; Height=40; FontSize=15; Text='LARINGE' },
    @{ X=660; Y=645; Width=190; Height=45; FontSize=13; Text='VISTA POSTERIOR' }
)
Add-TranslatedLabels (Join-Path $PhotoDir 'laringe-peca-disecada.jpg') @(
    @{ X=235; Y=4; Width=170; Height=45; FontSize=15; Text='EPIGLOTE' },
    @{ X=510; Y=65; Width=180; Height=45; FontSize=14; Text='OSSO HIOIDE' },
    @{ X=510; Y=125; Width=310; Height=55; FontSize=13; Text='PREGA ARIEPIGLÓTICA' },
    @{ X=545; Y=220; Width=230; Height=55; FontSize=13; Text='CARTILAGEM ARITENÓIDEA' },
    @{ X=550; Y=295; Width=280; Height=50; FontSize=13; Text='CARTILAGEM TIREÓIDEA' },
    @{ X=555; Y=365; Width=200; Height=45; FontSize=14; Text='SEIO PIRIFORME' },
    @{ X=540; Y=515; Width=220; Height=50; FontSize=13; Text='GLÂNDULA TIREOIDE' },
    @{ X=520; Y=585; Width=350; Height=65; FontSize=12; Text='MARGEM INFERIOR DA TRAQUEIA' }
)
Add-PhotoLabel (Join-Path $PhotoDir 'radiografia-ossificacao-laringea.jpg') 'RADIOGRAFIA LATERAL DO PESCOÇO' 'Calcificação e ossificação da cartilagem tireóidea'
Add-PhotoLegend (Join-Path $PhotoDir 'laringoscopia-normal.jpg') 'ESTRUTURAS IDENTIFICADAS NA FOTOGRAFIA' @(
    @{ Number='1'; Text='Prega vocal verdadeira' },
    @{ Number='2'; Text='Prega vestibular' },
    @{ Number='3'; Text='Epiglote' },
    @{ Number='4'; Text='Prega ariepiglótica' },
    @{ Number='5'; Text='Cartilagem aritenóidea' },
    @{ Number='6'; Text='Seio piriforme' },
    @{ Number='7'; Text='Base da língua' }
)
Add-PhotoLabel (Join-Path $PhotoDir 'pregas-inspiracao.jpg') 'INSPIRAÇÃO' 'Pregas vocais afastadas • glote aberta'
Add-PhotoLabel (Join-Path $PhotoDir 'pregas-fonacao.jpg') 'FONAÇÃO' 'Pregas vocais aproximadas • vibração'
Add-PhotoLabel (Join-Path $PhotoDir 'lesoes-pregas-vocais.jpg') 'ALTERAÇÕES DAS PREGAS VOCAIS' 'Lesões císticas e cicatriciais • registro clínico'
Add-PhotoLabel (Join-Path $PhotoDir 'laringite.jpg') 'LARINGITE' 'Sinais de inflamação da mucosa laríngea'
Add-PhotoLabel (Join-Path $PhotoDir 'edema-reinke.jpg') 'EDEMA DE REINKE' 'Aumento de volume das pregas vocais'
Add-PhotoLabel (Join-Path $PhotoDir 'epiglotite.jpg') 'EPIGLOTITE' 'Edema e inflamação da epiglote'

# Limpa temporários; o projeto final conserva somente as imagens processadas e os créditos.
Remove-Item $TempDir -Recurse -Force

# Confere se cada imagem local referenciada no HTML realmente existe.
$html = Get-Content (Join-Path $ProjectRoot 'index.html') -Raw -Encoding UTF8
$matches = [regex]::Matches($html, '<img[^>]+src="([^"]+)"')
$missing = @()
foreach ($match in $matches) {
    $relative = $match.Groups[1].Value
    if ($relative -match '^https?://') { continue }
    $full = Join-Path $ProjectRoot ($relative -replace '/', '\\')
    if (-not (Test-Path $full)) { $missing += $relative }
}
if ($missing.Count -gt 0) { throw "Imagens locais ausentes: $($missing -join ', ')" }

$photoCount = (Get-ChildItem $PhotoDir -File | Measure-Object).Count
if ($photoCount -lt 10) { throw "Foram preparadas apenas $photoCount imagens; esperado: pelo menos 10." }

$zipPath = Join-Path (Split-Path -Parent $ProjectRoot) 'laringe-e-voz-v5-pronto-github.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $ProjectRoot '*') -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host ''
Write-Host 'SUCESSO: fotografias baixadas, recortadas, identificadas em PT-BR e integradas ao projeto.' -ForegroundColor Green
Write-Host "Imagens locais: $photoCount"
Write-Host "Pacote final: $zipPath" -ForegroundColor Green
Write-Host 'Este é o ZIP que deve ser enviado ao GitHub Pages.'
