#!/bin/bash

# Define colors for a pro look
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting EIEPIMS Environment...${NC}"

# 1. Start Docker containers (using the direct path to be safe)
echo -e "${YELLOW}📦 Spinning up Docker containers (Nginx, PHP 8.3, MySQL)...${NC}"
./vendor/bin/sail up -d

# 2. Check if containers started correctly
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Containers are online!${NC}"
else
    echo -e "\033[0;31m❌ Failed to start containers. Is Docker running?${NC}"
    exit 1
fi

# 3. Start the Vite development server for React
echo -e "${YELLOW}⚡ Starting Vite Frontend...${NC}"
./vendor/bin/sail npm run dev
