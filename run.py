#!/usr/bin/env python3
"""
Soccer Data Scraper Application Runner

This script provides options to run different parts of the application:
- API server (Flask backend)
- Individual scrapers
- Full application setup
"""

import argparse
import subprocess
import sys
import os

def run_api():
    """Run the Flask API server"""
    print("Starting Flask API server on http://localhost:5000")
    print("Press Ctrl+C to stop")
    try:
        subprocess.run([sys.executable, 'api.py'], check=True)
    except KeyboardInterrupt:
        print("\nAPI server stopped")

def run_scraper(script_name):
    """Run a specific scraper script"""
    script_path = f"scripts/{script_name}.py"
    if not os.path.exists(script_path):
        print(f"Error: {script_path} not found")
        return

    print(f"Running {script_name} scraper...")
    try:
        subprocess.run([sys.executable, script_path], check=True)
        print(f"{script_name} scraper completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_name}: {e}")

def setup_frontend():
    """Setup instructions for React frontend"""
    print("React Frontend Setup:")
    print("1. Navigate to frontend directory: cd frontend")
    print("2. Install dependencies: npm install")
    print("3. Start development server: npm start")
    print("4. Open http://localhost:3000 in your browser")
    print("\nNote: Make sure the Flask API is running on port 5000")

def main():
    parser = argparse.ArgumentParser(description='Soccer Data Scraper Application')
    parser.add_argument('command', choices=['api', 'scraper', 'season', 'weekly', 'comprehensive', 'frontend'],
                       help='Command to run')
    parser.add_argument('--script', help='Scraper script name (for scraper command)')

    args = parser.parse_args()

    if args.command == 'api':
        run_api()
    elif args.command == 'scraper':
        if not args.script:
            print("Error: --script required for scraper command")
            sys.exit(1)
        run_scraper(args.script)
    elif args.command == 'season':
        run_scraper('scraper')
    elif args.command == 'weekly':
        run_scraper('weekly_fixtures')
    elif args.command == 'comprehensive':
        run_scraper('comprehensive_fixtures')
    elif args.command == 'frontend':
        setup_frontend()

if __name__ == '__main__':
    main()