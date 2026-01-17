#!/bin/bash
#
# Neon psql Connection Helper Script
#
# This script helps connect to Neon Postgres using psql with proper SSL configuration.
#
# Usage:
#   ./neon-psql-helper.sh [connection_string]
#   ./neon-psql-helper.sh  # Uses DATABASE_URL from environment
#
# Prerequisites:
#   - psql installed (see docs/NEON_CLIENT_CONNECTIONS.md)
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

# Check if psql is installed
check_psql() {
    if ! command -v psql &> /dev/null; then
        print_error "psql is not installed"
        echo ""
        echo "Install psql:"
        echo "  macOS: brew install libpq"
        echo "  Linux: sudo apt install postgresql-client"
        echo "  Windows: Download from https://www.postgresql.org/download/windows/"
        echo ""
        echo "See docs/NEON_CLIENT_CONNECTIONS.md for detailed instructions"
        exit 1
    fi
    print_info "psql found: $(psql --version)"
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
    
    if psql "$CONNECTION_STRING" -c "SELECT version();" > /dev/null 2>&1; then
        print_info "Connection successful!"
        return 0
    else
        print_error "Connection failed"
        return 1
    fi
}

# Main function
main() {
    echo "🔌 Neon psql Connection Helper"
    echo "================================"
    echo ""
    
    # Check prerequisites
    check_psql
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
    print_info "Connecting to Neon database..."
    echo ""
    echo "Useful commands:"
    echo "  \\l          - List databases"
    echo "  \\dt         - List tables"
    echo "  \\d table    - Describe table"
    echo "  \\dn         - List schemas"
    echo "  \\dx         - List extensions"
    echo "  \\q          - Quit"
    echo ""
    echo "================================"
    echo ""
    
    # Connect with psql
    psql "$CONNECTION_STRING"
}

# Run main function
main "$@"
