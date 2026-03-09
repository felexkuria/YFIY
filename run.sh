#!/bin/bash

echo "🎬 Ninja Movie Vault - Setup & Run"
echo "=================================="

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start server
echo "🚀 Starting streaming server..."
echo "Server will run on http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""
python stream_server.py
