#!/bin/bash

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm not found. Please install Node.js."
    exit 1
fi

echo "Starting Spotify Downloader..."
npm start
