#!/bin/bash
# Load NVM or set PATH if needed (optional but safer)
export PATH=/home/ubuntu/.nvm/versions/node/v24.14.0/bin:$PATH

# Navigate to the directory and run npm
cd /home/ubuntu/solvent/solvent-apps/solvent/work/certisfy-claim-recipes

#npm start

npx nodemon --exec "npm start"