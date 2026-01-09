#!/bin/bash

# ============================================================================
# Stop All Frontend Applications Script
# ============================================================================

echo "Stopping all Angular applications..."

# Kill processes on specific ports
for port in 4200 4202 4203 4204 4205; do
    pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo "Stopping process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
    fi
done

echo "All applications stopped."
