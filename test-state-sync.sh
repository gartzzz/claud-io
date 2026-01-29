#!/bin/bash
# Test script for state synchronization
# This simulates Claude Code writing to the state file

set -e

STATE_FILE="$HOME/.claude/claud-io-state.json"
CLAUDE_DIR="$HOME/.claude"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CLAUD.IO State Synchronization Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ensure directory exists
mkdir -p "$CLAUDE_DIR"

# Function to write a state
write_state() {
  local state=$1
  local event=$2
  local tool=$3

  if [ -z "$tool" ]; then
    tool_json="null"
  else
    tool_json="\"$tool\""
  fi

  cat > "$STATE_FILE" << EOF
{
  "state": "$state",
  "event": "$event",
  "sessionId": "test-session-$(date +%s)",
  "toolName": $tool_json,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

  echo "✓ State: $state | Event: $event | Tool: ${tool:-none}"
}

echo "Starting state simulation..."
echo "File: $STATE_FILE"
echo ""
echo "Make sure Claud.io app is running!"
echo ""
read -p "Press ENTER to start..."
echo ""

# Simulate a typical Claude session
echo "1. Session starts (idle)"
write_state "idle" "SessionStart" ""
sleep 2

echo "2. User submits prompt (thinking)"
write_state "thinking" "UserPromptSubmit" ""
sleep 2

echo "3. Claude reads a file (working)"
write_state "working" "PreToolUse" "Read"
sleep 1

write_state "working" "PostToolUse" "Read"
sleep 1

echo "4. Claude searches with grep (working)"
write_state "working" "PreToolUse" "Grep"
sleep 1

write_state "working" "PostToolUse" "Grep"
sleep 1

echo "5. Claude writes a file (working)"
write_state "working" "PreToolUse" "Write"
sleep 1

write_state "working" "PostToolUse" "Write"
sleep 1

echo "6. Claude runs bash command (working)"
write_state "working" "PreToolUse" "Bash"
sleep 2

write_state "working" "PostToolUse" "Bash"
sleep 1

echo "7. Task complete (done)"
write_state "done" "Stop" ""
sleep 3

echo "8. Session ends (idle)"
write_state "idle" "SessionEnd" ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Final state file:"
cat "$STATE_FILE"
echo ""
