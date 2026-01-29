#!/bin/bash

# Claud.io State Notifier Hook
# Receives Claude Code events and writes state updates for the Tauri app
# No external dependencies (no jq needed)

# Read hook input from stdin
INPUT=$(cat)

# Extract values using grep and sed (portable)
extract_json_value() {
  echo "$INPUT" | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*:.*"\([^"]*\)".*/\1/' | head -1
}

EVENT=$(extract_json_value "hook_event_name")
SESSION_ID=$(extract_json_value "session_id")
TOOL_NAME=$(extract_json_value "tool_name")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Default values
[ -z "$EVENT" ] && EVENT="unknown"
[ -z "$SESSION_ID" ] && SESSION_ID="unknown"

# Map hook events to visual states
case "$EVENT" in
  "SessionStart")
    STATE="idle"
    ;;
  "UserPromptSubmit")
    STATE="thinking"
    ;;
  "PreToolUse"|"SubagentStart")
    STATE="working"
    ;;
  "PostToolUse"|"PostToolUseFailure"|"SubagentStop")
    STATE="working"
    ;;
  "Stop")
    STATE="done"
    ;;
  "SessionEnd")
    STATE="idle"
    ;;
  *)
    STATE="thinking"
    ;;
esac

# State file location
STATE_FILE="$HOME/.claude/claud-io-state.json"

# Format tool name as JSON (null if empty)
if [ -z "$TOOL_NAME" ]; then
  TOOL_JSON="null"
else
  TOOL_JSON="\"$TOOL_NAME\""
fi

# Write current state as JSON
cat > "$STATE_FILE" << EOF
{
  "state": "$STATE",
  "event": "$EVENT",
  "sessionId": "$SESSION_ID",
  "toolName": $TOOL_JSON,
  "timestamp": "$TIMESTAMP"
}
EOF

exit 0
