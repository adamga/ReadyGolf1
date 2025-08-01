#!/bin/bash

# Simple test runner that starts the server and runs UI tests
echo "Starting ReadyGolf1 server..."

# Start the server in background
cd /home/runner/work/ReadyGolf1/ReadyGolf1
npm start &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "Server is running successfully"
    
    # Run the UI tests
    echo "Running UI tests..."
    npm test
    TEST_RESULT=$?
    
    # Kill the server
    kill $SERVER_PID
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo "All tests passed!"
    else
        echo "Tests failed with exit code $TEST_RESULT"
    fi
    
    exit $TEST_RESULT
else
    echo "Failed to start server"
    kill $SERVER_PID
    exit 1
fi