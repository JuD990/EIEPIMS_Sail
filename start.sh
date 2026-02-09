#!/bin/bash

# Define colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting EIEPIMS Environment...${NC}"

# 1. Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}📄 .env file missing. Copying from .env.example...${NC}"
    cp .env.example .env
fi

# 2. Start Docker containers
echo -e "${YELLOW}📦 Spinning up Docker containers (Nginx, PHP 8.3, MySQL)...${NC}"
./vendor/bin/sail up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers are online!${NC}"
else
    echo -e "${RED}❌ Failed to start containers.${NC}"
    exit 1
fi

# 3. Handle Application Key
if ! grep -q "APP_KEY=base64" .env; then
    echo -e "${YELLOW}🔑 Generating Application Key...${NC}"
    ./vendor/bin/sail artisan key:generate
fi

# 4. Handle Database Migrations and Seeding
echo -e "${YELLOW}🗄️ Checking database status...${NC}"
# We check if the 'users' table exists as a proxy for 'is the DB set up?'
if ! ./vendor/bin/sail artisan tinker --execute="Schema::hasTable('users')" | grep -q "true"; then
    echo -e "${YELLOW}🌱 Database is empty. Running migrations and seeders...${NC}"
    ./vendor/bin/sail artisan migrate --seed
    echo -e "${GREEN}✅ Database structure and seeds imported!${NC}"
else
    echo -e "${GREEN}✅ Database is already up to date.${NC}"
fi

# 5. Check for node_modules (Vite)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 node_modules not found. Installing npm dependencies...${NC}"
    ./vendor/bin/sail npm install
fi

# 6. Start Vite
echo -e "${GREEN}⚡ Starting Vite Frontend...${NC}"
./vendor/bin/sail npm run dev