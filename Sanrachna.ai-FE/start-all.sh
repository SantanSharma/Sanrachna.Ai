#!/bin/bash

# ============================================================================
# Sanrachna.AI Frontend Applications Starter Script
# ============================================================================
# This script starts all frontend applications on their designated ports:
# - Login Terminal:           http://localhost:4200
# - StandBy Habits:           http://localhost:4202
# - Anti-Goal:                http://localhost:4203
# - LoginHeaderAngularTemplate: http://localhost:4204
# - Viraasat360:              http://localhost:4205
# ============================================================================

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Sanrachna.AI Frontend Starter Script    ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to start an app
start_app() {
    local app_name=$1
    local app_path=$2
    local port=$3
    
    echo -e "${YELLOW}Starting $app_name on port $port...${NC}"
    
    if check_port $port; then
        echo -e "${RED}  ⚠ Port $port is already in use. Skipping $app_name.${NC}"
        return 1
    fi
    
    cd "$BASE_DIR/$app_path"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  Installing dependencies for $app_name...${NC}"
        npm install > /dev/null 2>&1
    fi
    
    # Start the app in the background
    ng serve --port $port > /dev/null 2>&1 &
    local pid=$!
    
    echo -e "${GREEN}  ✓ $app_name started (PID: $pid)${NC}"
    echo $pid
}

# Array to store PIDs
declare -a PIDS

# Start all applications
echo -e "${BLUE}Starting applications...${NC}"
echo ""

# Login Terminal (Port 4200)
cd "$BASE_DIR/LoginTerminal" 2>/dev/null
if [ -d "$BASE_DIR/LoginTerminal" ]; then
    start_app "Login Terminal" "LoginTerminal" 4200
    PIDS+=($!)
else
    echo -e "${RED}  ✗ Login Terminal directory not found${NC}"
fi

echo ""

# StandBy Habits (Port 4202)
cd "$BASE_DIR/StandBy-Habits/standby" 2>/dev/null
if [ -d "$BASE_DIR/StandBy-Habits/standby" ]; then
    start_app "StandBy Habits" "StandBy-Habits/standby" 4202
    PIDS+=($!)
else
    echo -e "${RED}  ✗ StandBy Habits directory not found${NC}"
fi

echo ""

# Anti-Goal (Port 4203)
cd "$BASE_DIR/Anti-Goal" 2>/dev/null
if [ -d "$BASE_DIR/Anti-Goal" ]; then
    start_app "Anti-Goal" "Anti-Goal" 4203
    PIDS+=($!)
else
    echo -e "${RED}  ✗ Anti-Goal directory not found${NC}"
fi

echo ""

# LoginHeaderAngularTemplate (Port 4204)
cd "$BASE_DIR/LoginHeaderAngularTemplate" 2>/dev/null
if [ -d "$BASE_DIR/LoginHeaderAngularTemplate" ]; then
    start_app "LoginHeaderAngularTemplate" "LoginHeaderAngularTemplate" 4204
    PIDS+=($!)
else
    echo -e "${RED}  ✗ LoginHeaderAngularTemplate directory not found${NC}"
fi

echo ""

# Viraasat360 (Port 4205)
cd "$BASE_DIR/Viraasat360" 2>/dev/null
if [ -d "$BASE_DIR/Viraasat360" ]; then
    start_app "Viraasat360" "Viraasat360" 4205
    PIDS+=($!)
else
    echo -e "${RED}  ✗ Viraasat360 directory not found${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}All applications starting...${NC}"
echo ""
echo -e "  ${GREEN}●${NC} Login Terminal:           ${BLUE}http://localhost:4200${NC}"
echo -e "  ${GREEN}●${NC} StandBy Habits:           ${BLUE}http://localhost:4202${NC}"
echo -e "  ${GREEN}●${NC} Anti-Goal:                ${BLUE}http://localhost:4203${NC}"
echo -e "  ${GREEN}●${NC} LoginHeaderAngularTemplate: ${BLUE}http://localhost:4204${NC}"
echo -e "  ${GREEN}●${NC} Viraasat360:              ${BLUE}http://localhost:4205${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all applications${NC}"
echo -e "${BLUE}============================================${NC}"

# Wait for all background processes
wait
