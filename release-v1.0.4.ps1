# 🚀 Quick Release Script for v1.0.4
# This script helps you quickly create and push a release tag

Write-Host "🎯 Koya Score v1.0.4 Release Helper" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Warning: You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "❌ Aborted by user" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📋 What would you like to do?" -ForegroundColor Green
Write-Host "1. Create and push tag v1.0.4 (triggers automatic build)"
Write-Host "2. Just push existing tag v1.0.4"
Write-Host "3. Delete tag v1.0.4 (local and remote)"
Write-Host "4. View current tags"
Write-Host "5. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🏷️  Creating tag v1.0.4..." -ForegroundColor Cyan
        
        # Check if tag already exists locally
        $tagExists = git tag -l "v1.0.4"
        if ($tagExists) {
            Write-Host "⚠️  Tag v1.0.4 already exists locally" -ForegroundColor Yellow
            $overwrite = Read-Host "Do you want to delete and recreate it? (y/N)"
            if ($overwrite -eq 'y' -or $overwrite -eq 'Y') {
                git tag -d v1.0.4
                Write-Host "✅ Deleted local tag v1.0.4" -ForegroundColor Green
            } else {
                Write-Host "❌ Aborted" -ForegroundColor Red
                exit 1
            }
        }
        
        # Create the tag
        git tag -a v1.0.4 -m "Release version 1.0.4 - Koya Score"
        Write-Host "✅ Created tag v1.0.4" -ForegroundColor Green
        
        # Push the tag
        Write-Host ""
        Write-Host "📤 Pushing tag to remote..." -ForegroundColor Cyan
        git push origin v1.0.4
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 Success! Tag v1.0.4 has been pushed!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📱 Next steps:" -ForegroundColor Cyan
            Write-Host "1. GitHub Actions will automatically start building Android and iOS"
            Write-Host "2. Check progress at: https://github.com/$(git config --get remote.origin.url | Select-String -Pattern '([^/:]+/[^/.]+)\.git' | ForEach-Object { $_.Matches.Groups[1].Value })/actions"
            Write-Host "3. Monitor EAS builds at: https://expo.dev"
            Write-Host ""
        } else {
            Write-Host "❌ Failed to push tag" -ForegroundColor Red
            exit 1
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "📤 Pushing tag v1.0.4..." -ForegroundColor Cyan
        git push origin v1.0.4
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tag pushed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to push tag" -ForegroundColor Red
            exit 1
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🗑️  Deleting tag v1.0.4..." -ForegroundColor Yellow
        
        $confirm = Read-Host "Are you sure you want to delete tag v1.0.4? (y/N)"
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Host "❌ Aborted" -ForegroundColor Red
            exit 1
        }
        
        # Delete local tag
        git tag -d v1.0.4 2>$null
        Write-Host "✅ Deleted local tag" -ForegroundColor Green
        
        # Delete remote tag
        git push origin :refs/tags/v1.0.4 2>$null
        Write-Host "✅ Deleted remote tag" -ForegroundColor Green
    }
    
    "4" {
        Write-Host ""
        Write-Host "🏷️  Current tags:" -ForegroundColor Cyan
        git tag -l
        Write-Host ""
    }
    
    "5" {
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
