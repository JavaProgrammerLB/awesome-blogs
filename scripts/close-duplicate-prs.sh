#!/bin/bash

# Script to close duplicate pull requests and delete their branches
# Usage: ./scripts/close-duplicate-prs.sh [PR_NUMBERS...]
# Example: ./scripts/close-duplicate-prs.sh 242 243 244 245 246 247

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Please install it: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Default PR numbers if none provided
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}No PR numbers provided. Using default list of duplicate PRs:${NC}"
    PR_NUMBERS=(242 243 244 245 246 247)
else
    PR_NUMBERS=("$@")
fi

REASON="Closing duplicate PR - content already merged in another PR"

echo -e "${GREEN}Starting to process ${#PR_NUMBERS[@]} pull request(s)${NC}"
echo "---"

for pr_num in "${PR_NUMBERS[@]}"; do
    echo -e "${YELLOW}Processing PR #$pr_num${NC}"
    
    # Get PR details
    if ! pr_info=$(gh pr view "$pr_num" --json headRefName,state,title 2>&1); then
        echo -e "${RED}✗ PR #$pr_num not found, skipping${NC}"
        echo "---"
        continue
    fi
    
    # Extract information
    state=$(echo "$pr_info" | jq -r '.state')
    branch=$(echo "$pr_info" | jq -r '.headRefName')
    title=$(echo "$pr_info" | jq -r '.title')
    
    echo "  Title: $title"
    echo "  Branch: $branch"
    echo "  State: $state"
    
    # Check if PR is already closed
    if [ "$state" = "CLOSED" ] || [ "$state" = "MERGED" ]; then
        echo -e "${YELLOW}  ℹ PR #$pr_num is already $state, skipping${NC}"
        echo "---"
        continue
    fi
    
    # Close the PR with a comment
    if gh pr close "$pr_num" --comment "$REASON"; then
        echo -e "${GREEN}  ✓ Closed PR #$pr_num${NC}"
    else
        echo -e "${RED}  ✗ Failed to close PR #$pr_num${NC}"
        echo "---"
        continue
    fi
    
    # Delete the branch
    if git ls-remote --heads origin "$branch" 2>/dev/null | grep -q "refs/heads/$branch$"; then
        if git push origin --delete "$branch" 2>/dev/null; then
            echo -e "${GREEN}  ✓ Deleted branch: $branch${NC}"
        else
            echo -e "${RED}  ✗ Failed to delete branch: $branch${NC}"
        fi
    else
        echo -e "${YELLOW}  ℹ Branch $branch does not exist remotely${NC}"
    fi
    
    echo "---"
done

echo -e "${GREEN}All specified PRs processed successfully!${NC}"
