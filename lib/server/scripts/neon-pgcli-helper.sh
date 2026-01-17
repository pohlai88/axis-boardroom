#!/bin/bash
#
# Neon pgcli Connection Helper Script
#
# This script helps connect to Neon Postgres using pgcli with proper SSL configuration.
#
# Usage:
#   ./neon-pgcli-helper.sh [connection_string]
#   ./neon-pgcli-helper.sh  # Uses DATABASE_URL from environment
#
# Prerequisites:
#   - pgcli installed: pip install pgcli
#   - DATABASE_URL environment variable set (optional)
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if pgcli is installed
check_pgcli() {
    if ! command -v pgcli &> /dev/null; then
        print_error "pgcli is not installed"
        echo ""
        echo "Install pgcli:"
        echo "  pip install pgcli"
        echo "  # Or with pipx (recommended):"
        echo "  pipx install pgcli"
        echo ""
        echo "See docs/NEON_CLIENT_CONNECTIONS.md for detailed instructions"
        exit 1
    fi
    print_info "pgcli found: $(pgcli --version)"
}

# Get connection string
get_connection_string() {
    if [ -n "$1" ]; then
        CONNECTION_STRING="$1"
    elif [ -n "$DATABASE_URL" ]; then
        CONNECTION_STRING="$DATABASE_URL"
    else
        print_error "No connection string provided"
        echo ""
        echo "Usage:"
        echo "  $0 [connection_string]"
        echo "  $0  # Uses DATABASE_URL from environment"
        echo ""
        echo "Get connection string from:"
        echo "  https://console.neon.tech → Project → Connect"
        exit 1
    fi
    
    # Ensure sslmode=require is set
    if [[ ! "$CONNECTION_STRING" == *"sslmode"* ]]; then
        if [[ "$CONNECTION_STRING" == *"?"* ]]; then
            CONNECTION_STRING="${CONNECTION_STRING}&sslmode=require"
        else
            CONNECTION_STRING="${CONNECTION_STRING}?sslmode=require"
        fi
        print_info "Added sslmode=require to connection string"
    fi
}

# Test connection
test_connection() {
    print_info "Testing connection..."
    
    if pgcli "$CONNECTION_STRING" -c "SELECT version();" > /dev/null 2>&1; then
        print_info "Connection successful!"
        return 0
    else
        print_error "Connection failed"
        return 1
    fi
}

# Main function
main() {
    echo "🔌 Neon pgcli Connection Helper"
    echo "================================"
    echo ""
    
    # Check prerequisites
    check_pgcli
    echo ""
    
    # Get connection string
    get_connection_string "$@"
    echo ""
    
    # Test connection
    if ! test_connection; then
        echo ""
        print_warning "Connection test failed, but continuing..."
        echo ""
    fi
    
    # Connect
    print_info "Connecting to Neon database with pgcli..."
    echo ""
    echo "pgcli features:"
    echo "  - Auto-completion with Tab"
    echo "  - Syntax highlighting"
    echo "  - Multi-line editing"
    echo "  - Query history"
    echo "  - Pretty table formatting"
    echo ""
    echo "Press Ctrl+D or type \\q to exit"
    echo ""
    echo "================================"
    echo ""
    
    # Connect with pgcli
    pgcli "$CONNECTION_STRING"
}

# Run main function
main "$@"
