#!/bin/bash

# WaveWarz Analytics API Test Script
# Usage: ./test-api.sh https://your-app.vercel.app your-api-secret

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}Error: Missing API URL${NC}"
    echo "Usage: ./test-api.sh https://your-app.vercel.app your-api-secret"
    exit 1
fi

API_URL=$1
API_SECRET=$2

echo -e "${YELLOW}Testing WaveWarz Analytics API...${NC}\n"

# Test 1: Stats endpoint
echo -e "${YELLOW}1. Testing GET /api/stats${NC}"
response=$(curl -s "${API_URL}/api/stats")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Stats endpoint working${NC}"
    echo "$response" | jq '.'
else
    echo -e "${RED}✗ Stats endpoint failed${NC}"
    echo "$response"
fi
echo ""

# Test 2: Battles endpoint
echo -e "${YELLOW}2. Testing GET /api/battles${NC}"
response=$(curl -s "${API_URL}/api/battles?limit=3")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Battles endpoint working${NC}"
    echo "$response" | jq '.data | length' | xargs echo "Found battles:"
else
    echo -e "${RED}✗ Battles endpoint failed${NC}"
    echo "$response"
fi
echo ""

# Test 3: Leaderboard endpoint
echo -e "${YELLOW}3. Testing GET /api/leaderboard${NC}"
response=$(curl -s "${API_URL}/api/leaderboard?limit=5")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Leaderboard endpoint working${NC}"
    echo "$response" | jq '.data | length' | xargs echo "Found artists:"
else
    echo -e "${RED}✗ Leaderboard endpoint failed${NC}"
    echo "$response"
fi
echo ""

# Test 4: Sync endpoint (if API secret provided)
if [ -n "$API_SECRET" ]; then
    echo -e "${YELLOW}4. Testing POST /api/sync${NC}"
    response=$(curl -s -X POST "${API_URL}/api/sync?api_secret=${API_SECRET}&limit=5")
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✓ Sync endpoint working${NC}"
        echo "$response" | jq '.'
    else
        echo -e "${RED}✗ Sync endpoint failed${NC}"
        echo "$response"
    fi
else
    echo -e "${YELLOW}4. Skipping sync test (no API secret provided)${NC}"
fi
echo ""

echo -e "${GREEN}API tests completed!${NC}"
