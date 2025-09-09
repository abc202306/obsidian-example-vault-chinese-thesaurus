# 脚本作用：读取每个 .md 文件的 YAML frontmatter 中 ctime 字段，
# 并将文件的 CreationTime 更新为该值

$flagShowCTimeNotUpdated = $false;

Get-ChildItem -Path "C:\Users\mmsac\OneDrive\Documents\obsidian\obnote\" -Filter '*.md' -File -Recurse | ForEach-Object {
    $file = $_
    # 使用 -LiteralPath 避免路径中的 [] 等字符被当作通配符
    $fullText = Get-Content -LiteralPath $file.FullName -Raw
    
    if ($fullText -match '(?s)^---\s*\r?\n(.*?)\r?\n---\s*') {
        $yamlBlock = $matches[1]

        if ($yamlBlock -match '(?m)^\s*ctime\s*:\s*(\S+)\s*$') {
            $ctimeString = $matches[1]

            try {
                $dto = [datetimeoffset]::Parse($ctimeString)

                # 同样用 -LiteralPath 获取文件对象
                $item = Get-Item -LiteralPath $file.FullName
                $tOld = $item.CreationTime;
                $tNew = $dto.LocalDateTime;
                $tNew = Get-Date -Year $tNew.Year -Month $tNew.Month -Day $tNew.Day -Hour $tNew.Hour -Minute $tNew.Minute -Second $tNew.Second -Millisecond $tOld.Millisecond;
                $timeDiff = $tNew - $tOld;
                if ([Math]::Abs($timeDiff.TotalMilliseconds) -ge 1000) {
                    Write-Host "⏲️🔴 已更新 '$($file.Name)' CreationTime 为 $($tNew.toString("o"))，之前的值为 $($tOld.toString("o"))，时间差异 $($timeDiff.TotalMilliseconds) Milliseconds";
                    $item.CreationTime = $tNew;
                }
                else {
                    if ($flagShowCTimeNotUpdated) {
                        Write-Host "⏲️🟢 未更新 '$($file.Name)' CreationTime 已是 $($tOld.toString("o"))，无需更新"
                    }   
                }
            }
            catch {
                Write-Warning "⏲️⚠️ 无法解析时间 '$ctimeString' （文件：$($file.Name)）"
            }
        }
        else {
            Write-Host "⏲️ℹ️ 未找到 ctime 字段：$($file.Name)"
        }
    }
    else {
        Write-Host "📄ℹ️ 未检测到 YAML frontmatter：$($file.Name)"
    }
}
