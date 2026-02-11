#!/bin/sh

if [ -f .env ]; then
  echo ".env already exists"
  exit 0
fi

cp .env.example .env

JWT_SECRET=$(openssl rand -hex 32)
TWOFA_ENC_KEY=$(openssl rand -hex 32)

# macOS compatible sed
sed -i '' "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
sed -i '' "s/^TWOFA_ENC_KEY=.*/TWOFA_ENC_KEY=$TWOFA_ENC_KEY/" .env

echo ".env generated successfully"
