#!/bin/bash

# BASHER v3.5 Installation Script

echo "╔═══════════════════════════════════════╗"
echo "║   BASHER v3.5 Installation            ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js >= 18.0.0"
    exit 1
fi

echo "✓ Node.js: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "⚠ Python3 not found. Ghost DNS server will not be available."
else
    echo "✓ Python3: $(python3 --version)"
fi

# Install Node dependencies
echo ""
echo "Installing Node.js dependencies..."
npm install

# Install Python dependencies
if command -v python3 &> /dev/null; then
    echo ""
    echo "Installing Python dependencies..."
    cd ghost-server
    pip3 install -r requirements.txt
    cd ..
fi

# Make scripts executable
chmod +x install.sh

echo ""
echo "✓ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Edit config/basher.config.json"
echo "  2. Run: npm start"
echo "  3. Open browser: http://localhost:3000"
echo ""
echo "For systemd service installation:"
echo "  sudo cp systemd/basher.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable basher"
echo "  sudo systemctl start basher"
echo ""
