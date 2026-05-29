#!/usr/bin/env bash
# DoneGraph installer (macOS / Linux)
#
# Usage:
#   ./install.sh                       Prompt for platform
#   ./install.sh <platform>            Install for <platform>
#   ./install.sh --update              Pull latest changes and rebuild
#   ./install.sh --uninstall <plat>    Remove links for <plat>
#   ./install.sh --help
#
# Curl-pipe usage after publishing:
#   curl -fsSL https://raw.githubusercontent.com/serein431/DoneGraph/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/serein431/DoneGraph/main/install.sh | bash -s codex
#
# Environment:
#   DONEGRAPH_REPO_URL  Override clone URL
#   DONEGRAPH_DIR       Override clone destination

set -euo pipefail

REPO_URL="${DONEGRAPH_REPO_URL:-https://github.com/serein431/DoneGraph.git}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/package.json" && -d "$SCRIPT_DIR/plugins/donegraph/skills" ]]; then
  REPO_DIR="${DONEGRAPH_DIR:-$SCRIPT_DIR}"
else
  REPO_DIR="${DONEGRAPH_DIR:-$HOME/.donegraph/repo}"
fi

PLUGIN_LINK="$HOME/.donegraph-plugin"

platforms_table() {
  cat <<EOF
codex|$HOME/.agents/skills|per-skill
claude|$HOME/.agents/skills|per-skill
cursor|$HOME/.cursor/skills|folder
vscode|$HOME/.copilot/skills|per-skill
gemini|$HOME/.agents/skills|per-skill
opencode|$HOME/.agents/skills|per-skill
generic|$HOME/.agents/skills|per-skill
EOF
}

platform_ids() { platforms_table | cut -d'|' -f1; }

resolve_platform() {
  local id="$1"
  local row
  row="$(platforms_table | awk -F'|' -v id="$id" '$1==id {print; exit}')"
  if [[ -z "$row" ]]; then
    printf 'Unknown platform: %s\n' "$id" >&2
    printf 'Supported: %s\n' "$(platform_ids | tr '\n' ' ')" >&2
    exit 1
  fi
  printf '%s\n' "$row"
}

prompt_platform() {
  local ids=()
  while IFS= read -r id; do ids+=("$id"); done < <(platform_ids)

  printf 'Which platform are you installing for?\n' >&2
  local i=1
  for id in "${ids[@]}"; do
    printf '  %d) %s\n' "$i" "$id" >&2
    i=$((i+1))
  done
  printf 'Choose [1-%d]: ' "${#ids[@]}" >&2

  local choice=""
  if { exec 3</dev/tty; } 2>/dev/null; then
    read -r choice <&3 || true
    exec 3<&-
  else
    read -r choice || true
  fi
  if [[ -z "$choice" ]]; then
    printf '\nNo input received. Pass the platform as an argument instead, e.g.:\n' >&2
    printf '  ./install.sh codex\n' >&2
    exit 1
  fi
  if ! [[ "$choice" =~ ^[0-9]+$ ]] || (( choice < 1 || choice > ${#ids[@]} )); then
    printf 'Invalid choice: %s\n' "$choice" >&2
    exit 1
  fi
  printf '%s\n' "${ids[$((choice-1))]}"
}

clone_or_update() {
  if [[ -f "$REPO_DIR/package.json" && -d "$REPO_DIR/plugins/donegraph/skills" ]]; then
    printf -- '-> Using checkout at %s\n' "$REPO_DIR"
    if [[ -d "$REPO_DIR/.git" ]]; then
      git -C "$REPO_DIR" pull --ff-only
    fi
    return 0
  fi

  if [[ -d "$REPO_DIR/.git" ]]; then
    printf -- '-> Updating existing checkout at %s\n' "$REPO_DIR"
    git -C "$REPO_DIR" pull --ff-only
  else
    printf -- '-> Cloning %s -> %s\n' "$REPO_URL" "$REPO_DIR"
    mkdir -p "$(dirname "$REPO_DIR")"
    git clone "$REPO_URL" "$REPO_DIR"
  fi
}

ensure_built() {
  printf -- '-> Installing dependencies and building DoneGraph\n'
  cd "$REPO_DIR"
  npm install
  npm run build
}

skills_root() { printf '%s\n' "$REPO_DIR/plugins/donegraph/skills"; }

list_skills() {
  local root
  root="$(skills_root)"
  if [[ ! -d "$root" ]]; then
    printf 'Skills directory not found: %s\n' "$root" >&2
    exit 1
  fi
  local d
  for d in "$root"/*/; do
    [[ -d "$d" ]] || continue
    basename "$d"
  done
}

link_skills() {
  local target="$1" style="$2"
  local root
  root="$(skills_root)"
  mkdir -p "$target"
  case "$style" in
    per-skill)
      local skill
      while IFS= read -r skill; do
        ln -sfn "$root/$skill" "$target/$skill"
        printf '  linked %s -> %s\n' "$target/$skill" "$root/$skill"
      done < <(list_skills)
      ;;
    folder)
      ln -sfn "$root" "$target/donegraph"
      printf '  linked %s -> %s\n' "$target/donegraph" "$root"
      ;;
    *)
      printf 'Unknown style: %s\n' "$style" >&2
      exit 1
      ;;
  esac
}

unlink_skills() {
  local target="$1" style="$2"
  [[ -d "$target" ]] || return 0
  case "$style" in
    per-skill)
      if [[ -d "$(skills_root)" ]]; then
        local skill
        while IFS= read -r skill; do
          [[ -L "$target/$skill" ]] && rm -f "$target/$skill"
        done < <(list_skills)
      else
        local link resolved
        for link in "$target"/*; do
          [[ -L "$link" ]] || continue
          resolved="$(readlink "$link" 2>/dev/null || true)"
          [[ "$resolved" == *"/plugins/donegraph/skills/"* ]] || continue
          rm -f "$link"
        done
      fi
      ;;
    folder)
      [[ -L "$target/donegraph" ]] && rm -f "$target/donegraph"
      ;;
  esac
}

link_plugin_root() {
  if [[ -L "$PLUGIN_LINK" || -e "$PLUGIN_LINK" ]]; then
    rm -f "$PLUGIN_LINK"
  fi
  ln -s "$REPO_DIR/plugins/donegraph" "$PLUGIN_LINK"
  printf '  linked %s -> %s\n' "$PLUGIN_LINK" "$REPO_DIR/plugins/donegraph"
}

cmd_install() {
  local id="$1"
  local row target style
  row="$(resolve_platform "$id")"
  target="$(printf '%s\n' "$row" | cut -d'|' -f2)"
  style="$(printf '%s\n' "$row" | cut -d'|' -f3)"

  clone_or_update
  ensure_built
  printf -- '-> Linking skills for %s (%s -> %s)\n' "$id" "$style" "$target"
  link_skills "$target" "$style"
  printf -- '-> Linking universal plugin root\n'
  link_plugin_root

  printf '\nInstalled DoneGraph for %s\n' "$id"
  printf 'Restart your CLI or IDE, then use /donegraph-start, /donegraph-capture, and /donegraph-dashboard.\n'
}

cmd_uninstall() {
  local id="$1"
  local row target style
  row="$(resolve_platform "$id")"
  target="$(printf '%s\n' "$row" | cut -d'|' -f2)"
  style="$(printf '%s\n' "$row" | cut -d'|' -f3)"

  printf -- '-> Removing skill links for %s\n' "$id"
  unlink_skills "$target" "$style"
  if [[ -L "$PLUGIN_LINK" ]]; then
    rm -f "$PLUGIN_LINK"
    printf '  removed %s\n' "$PLUGIN_LINK"
  fi
  printf '\nThe checkout at %s was kept.\n' "$REPO_DIR"
}

cmd_update() {
  clone_or_update
  ensure_built
  printf 'Updated DoneGraph.\n'
}

usage() {
  cat <<USAGE
DoneGraph installer

Usage:
  install.sh [<platform>]            Install for <platform> (or prompt if omitted)
  install.sh --update                Pull latest changes and rebuild
  install.sh --uninstall <platform>  Remove links for <platform>
  install.sh --help

Supported platforms:
$(platform_ids | sed 's/^/  - /')

Environment:
  DONEGRAPH_REPO_URL  Override clone URL (default: $REPO_URL)
  DONEGRAPH_DIR       Override clone destination (default: current checkout or \$HOME/.donegraph/repo)
USAGE
}

main() {
  case "${1:-}" in
    -h|--help)
      usage
      ;;
    --update)
      cmd_update
      ;;
    --uninstall)
      shift
      if [[ -z "${1:-}" ]]; then
        printf '%s\n' '--uninstall requires a platform argument' >&2
        usage >&2
        exit 1
      fi
      cmd_uninstall "$1"
      ;;
    "")
      local id
      id="$(prompt_platform)"
      cmd_install "$id"
      ;;
    -*)
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 1
      ;;
    *)
      cmd_install "$1"
      ;;
  esac
}

main "$@"
