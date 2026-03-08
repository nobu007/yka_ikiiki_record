#!/bin/bash
# Autonomous Improvement Prioritizer - Phase 3 of the autonomous loop
# Intelligently prioritizes improvement opportunities based on impact and effort

set -e

echo "🎯 AUTONOMOUS IMPROVEMENT PRIORITIZER"
echo "====================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Find latest opportunities log
LATEST_LOG=$(ls -t /tmp/improvement_opportunities_*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo -e "${YELLOW}⚠️  No opportunities log found. Run scan first.${NC}"
    exit 1
fi

echo "📋 Analyzing opportunities from: $(basename "$LATEST_LOG")"
echo ""

# Create prioritized plan
PRIORITIZED_PLAN="/tmp/prioritized_improvements_$(date +%s).md"
EXECUTION_QUEUE="/tmp/execution_queue_$(date +%s).sh"

echo "# Prioritized Improvement Plan" > "$PRIORITIZED_PLAN"
echo "Generated: $(date)" >> "$PRIORITIZED_PLAN"
echo "" >> "$PRIORITIZED_PLAN"

echo "#!/bin/bash" > "$EXECUTION_QUEUE"
echo "# Auto-generated execution queue for improvements" >> "$EXECUTION_QUEUE"
echo "# Execute with: ./execution_queue.sh" >> "$EXECUTION_QUEUE"
echo "" >> "$EXECUTION_QUEUE"

# Priority scoring function
calculate_score() {
    local priority=$1
    local impact=$2
    local effort=$3
    
    local priority_score
    case $priority in
        "CRITICAL") priority_score=100 ;;
        "HIGH") priority_score=75 ;;
        "MEDIUM") priority_score=50 ;;
        "LOW") priority_score=25 ;;
        *) priority_score=10 ;;
    esac
    
    local impact_score
    case $impact in
        "CRITICAL") impact_score=100 ;;
        "HIGH") impact_score=75 ;;
        "MEDIUM") impact_score=50 ;;
        "LOW") impact_score=25 ;;
        *) impact_score=10 ;;
    esac
    
    local effort_score
    case $effort in
        "LOW") effort_score=100 ;;
        "MEDIUM") effort_score=75 ;;
        "HIGH") effort_score=50 ;;
        "CRITICAL") effort_score=25 ;;
        *) effort_score=50 ;;
    esac
    
    # Weighted score: Priority (50%) + Impact (30%) + Effort (20%)
    local total_score=$(( (priority_score * 50 + impact_score * 30 + effort_score * 20) / 100 ))
    echo $total_score
}

# Parse opportunities using a simpler approach
echo "🔍 Parsing and scoring opportunities..."
echo ""

# Temporary file for parsed opportunities
> "/tmp/sorted_opportunities.tmp"

# Process the log file line by line
{
    priority=""
    category=""
    evidence=""
    impact=""
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^\[.*\].* ]]; then
            # If we have a complete previous opportunity, save it
            if [[ -n "$priority" && -n "$category" && -n "$evidence" && -n "$impact" ]]; then
                # Estimate effort based on category
                effort="MEDIUM"
                case $category in
                    "Code Quality")
                        effort="MEDIUM"
                        ;;
                    "Testing")
                        effort="MEDIUM"
                        ;;
                    "Security")
                        effort="HIGH"
                        ;;
                    "Performance")
                        effort="MEDIUM"
                        ;;
                    "Documentation")
                        effort="LOW"
                        ;;
                    "Architecture")
                        effort="LOW"
                        ;;
                    *)
                        effort="MEDIUM"
                        ;;
                esac
                
                # Calculate score
                score=$(calculate_score "$priority" "$impact" "$effort")
                
                # Store for sorting
                echo "$score|$priority|$category|$category improvement opportunity|$evidence|$impact|$effort" >> "/tmp/sorted_opportunities.tmp"
            fi
            
            # Extract priority and category
            priority=$(echo "$line" | sed 's/^\[\(.*\)\].*/\1/')
            category=$(echo "$line" | sed 's/^\[.*\] \(.*\):.*/\1/')
            
            # Reset evidence and impact
            evidence=""
            impact=""
            
        elif [[ "$line" =~ ^.*Evidence:.* ]]; then
            evidence=$(echo "$line" | sed 's/.*Evidence: //')
        elif [[ "$line" =~ ^.*Impact:.* ]]; then
            impact=$(echo "$line" | sed 's/.*Impact: //')
        fi
    done
    
    # Save the last opportunity
    if [[ -n "$priority" && -n "$category" && -n "$evidence" && -n "$impact" ]]; then
        # Estimate effort based on category
        effort="MEDIUM"
        case $category in
            "Code Quality")
                effort="MEDIUM"
                ;;
            "Testing")
                effort="MEDIUM"
                ;;
            "Security")
                effort="HIGH"
                ;;
            "Performance")
                effort="MEDIUM"
                ;;
            "Documentation")
                effort="LOW"
                ;;
            "Architecture")
                effort="LOW"
                ;;
            *)
                effort="MEDIUM"
                ;;
        esac
        
        # Calculate score
        score=$(calculate_score "$priority" "$impact" "$effort")
        
        # Store for sorting
        echo "$score|$priority|$category|$category improvement opportunity|$evidence|$impact|$effort" >> "/tmp/sorted_opportunities.tmp"
    fi
} < "$LATEST_LOG"

# Sort by score (descending)
echo "📊 Ranking opportunities by priority score..."
echo ""

sort -nr "/tmp/sorted_opportunities.tmp" > "/tmp/ranked_opportunities.tmp"

# Generate prioritized plan and execution queue
echo "## Execution Priority Queue" >> "$PRIORITIZED_PLAN"
echo "" >> "$PRIORITIZED_PLAN"

rank=1
while IFS='|' read -r score priority category description evidence impact effort; do
    echo "### Rank $rank (Score: $score)" >> "$PRIORITIZED_PLAN"
    echo "**Priority:** $priority" >> "$PRIORITIZED_PLAN"
    echo "**Category:** $category" >> "$PRIORITIZED_PLAN"
    echo "**Description:** $description" >> "$PRIORITIZED_PLAN"
    echo "**Evidence:** $evidence" >> "$PRIORITIZED_PLAN"
    echo "**Impact:** $impact" >> "$PRIORITIZED_PLAN"
    echo "**Estimated Effort:** $effort" >> "$PRIORITIZED_PLAN"
    echo "" >> "$PRIORITIZED_PLAN"
    
    # Add to execution queue for high-priority items
    if [[ "$priority" == "CRITICAL" || "$priority" == "HIGH" ]]; then
        echo "# Rank $rank: $description" >> "$EXECUTION_QUEUE"
        echo "echo \"🎯 Executing Rank $rank: $description\"" >> "$EXECUTION_QUEUE"
        echo "echo \"Priority: $priority | Impact: $impact | Effort: $effort\"" >> "$EXECUTION_QUEUE"
        echo "# TODO: Add specific implementation commands here" >> "$EXECUTION_QUEUE"
        echo "" >> "$EXECUTION_QUEUE"
    fi
    
    rank=$((rank + 1))
done < "/tmp/ranked_opportunities.tmp"

# Summary statistics
total_opportunities=$(wc -l < "/tmp/ranked_opportunities.tmp" | tr -d ' \n\r')
critical_count=$(grep -c "|CRITICAL|" "/tmp/ranked_opportunities.tmp" 2>/dev/null | tr -d ' \n\r' || echo "0")
high_count=$(grep -c "|HIGH|" "/tmp/ranked_opportunities.tmp" 2>/dev/null | tr -d ' \n\r' || echo "0")

# Ensure we have valid numbers
total_opportunities=${total_opportunities:-0}
critical_count=${critical_count:-0}
high_count=${high_count:-0}

# Debug output
echo "Debug: total=$total_opportunities critical=$critical_count high=$high_count" >&2

echo "## Summary Statistics" >> "$PRIORITIZED_PLAN"
echo "- **Total Opportunities:** $total_opportunities" >> "$PRIORITIZED_PLAN"
echo "- **Critical Items:** $critical_count" >> "$PRIORITIZED_PLAN"
echo "- **High Priority Items:** $high_count" >> "$PRIORITIZED_PLAN"
echo "- **Ready for Execution:** $((critical_count + high_count)) items" >> "$PRIORITIZED_PLAN"

echo "======================================"
echo "PRIORITIZATION COMPLETE"
echo "======================================"
echo ""

echo -e "${GREEN}📋 Prioritized Plan: $PRIORITIZED_PLAN${NC}"
echo -e "${BLUE}🚀 Execution Queue: $EXECUTION_QUEUE${NC}"
echo ""

echo "📊 Summary:"
echo "- Total opportunities: $total_opportunities"
echo "- Critical items: $critical_count"
echo "- High priority: $high_count"
echo ""

if [ "$critical_count" -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ITEMS REQUIRE IMMEDIATE ACTION${NC}"
    echo "Review execution queue and implement critical fixes first."
    exit 1
elif [ "$high_count" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  High priority items should be addressed soon${NC}"
    echo "Execution queue ready for implementation."
    exit 0
else
    echo -e "${GREEN}✅ All items are medium/low priority - system is healthy${NC}"
    echo "Consider implementing improvements during next maintenance window."
    exit 0
fi

# Cleanup
rm -f "/tmp/sorted_opportunities.tmp" "/tmp/ranked_opportunities.tmp"
