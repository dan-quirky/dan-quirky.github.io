#!/bin/bash

### Autorun script to update readings.json in a new branch, push to remote and merge.

cd ~/repos/autoupdates_dan-quirky.github.io/dan-quirky.github.io/src

echo "Working in "$PWD

#Variables
echo Loading Secrets
if [ -f secrets.env ]; then
    . secrets.env
else
    echo "Secrets file not found!"
    exit 1
fi
printf -v currentDateTime '%(%Y%m%d-%H%M%S)T\n' -1 #Define currentDateTime variable
localBranchName=main
remotePushURL=$(git remote get-url --push origin)
remotePushURLWithCredentials="https://"$github_username:$auto_update_readings_json_key@${remotePushURL#https://}
# Create and switch to new branch, sync with remote
git checkout main
#reset local branch to exactly match remote main
git fetch origin
git reset --hard origin/main
# Run script to updated readings.json
echo -e "\n----Getting updated readings"
$node_path readBucket_writeFile.js
#update file on remote 
echo -e "\n----Pushing update to remote repo"
git add ../CO2Monitor/readings.json
git commit -m "readings.json auto update"
git push --force $remotePushURLWithCredentials $localBranchName:main
#clean up
git checkout main
git fetch origin
git reset --hard origin/main



