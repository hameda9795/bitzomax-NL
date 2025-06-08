# PowerShell script to commit, push changes to Git, and then deploy to the server

Write-Host "Adding changes to Git..."
git add frontend/src/environments/*.ts
git add frontend/src/app/services/*.ts

Write-Host "Committing changes..."
git commit -m "Fix API URLs to use environment variables"

Write-Host "Pushing to remote repository..."
git push

Write-Host "Changes pushed to Git successfully!"
Write-Host "Now you can connect to the server and run the following commands to deploy the changes:"
Write-Host "-------------------------------------------------------------------------"
Write-Host "cd /opt/bitzomax-git"
Write-Host "git pull"
Write-Host "cd frontend"
Write-Host "npm run build --configuration=production"
Write-Host "rm -rf /opt/bitzomax-git/frontend/dist/frontend/browser/*"  
Write-Host "cp -r dist/frontend/browser/* /opt/bitzomax-git/frontend/dist/frontend/browser/"
Write-Host "-------------------------------------------------------------------------"
Write-Host "After deploying, the login issue should be fixed."
