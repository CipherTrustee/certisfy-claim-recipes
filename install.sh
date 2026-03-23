#!/bin/bash
rm -r "certisfy-claim-recipes"

git clone https://github.com/CipherTrustee/certisfy-claim-recipes.git
echo "ubuntu" | sudo -S rm -r "certisfy-claim-recipes/.git"

cd "certisfy-claim-recipes/public/javascripts"
rm -r certisfy

git clone https://github.com/CipherTrustee/certisfy-js.git
mv "certisfy-js" certisfy
echo "ubuntu" | sudo -S rm -r "certisfy/.git"

sed -i '0,/\.\/*pkijs\.js/s//pkijs/' "certisfy/src/utils/cert.js"
sed -i '' '0,/\.\.\/utils\/pkijs\.js/s//pkijs/' "certisfy/src/core-pki/cert-gen.js"

cd ../../

npm ci
npm install pg
sudo systemctl restart certisfy-claim-recipes.service
sudo systemctl enable certisfy-claim-recipes.service

echo "Remember to swap pkijs imports for cert.js and cert-gen from browser to nodejs environment"