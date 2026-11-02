#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/devkit-manager"
PID_FILE="$STATE_DIR/devkit.pid"
LOG_FILE="$STATE_DIR/devkit.log"

source "$SCRIPT_DIR/lib/logger.sh"
source "$SCRIPT_DIR/lib/process.sh"

_is_devkit() {
    local pid="$1"
    local expected_start="$2"
    local actual_start
    local pgid
    local cmd

    [[ "$pid" =~ ^[0-9]+$ ]] || return 1
    [[ "$pid" -gt 1 ]] || return 1

    actual_start=$(ps -p "$pid" -o lstart=) || return 1
    [[ "$actual_start" == "$expected_start" ]] || return 1

    pgid=$(ps -p "$pid" -o pgid=) || return 1
    [[ "$pgid" -eq "$pid" ]] || return 1

    cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline") || return 1
    [[ "$cmd" == *"dbus-run-session"*"gnome-shell --devkit --wayland"* ]]
}

devkit_start() {
    local pid start_time

    if [[ -f "$PID_FILE" ]]; then
        log_warn "DevKit PID file already exists"
        return 1
    fi

    if ! command -v gnome-shell >/dev/null 2>&1; then 
        log_error "gnome-shell not found"
        return 1
    fi

    mkdir -p -- "$STATE_DIR"
    log_info "Starting GNOME Shell DevKit..."

    setsid dbus-run-session -- \
        gnome-shell --devkit --wayland \
        >"$LOG_FILE" 2>&1 </dev/null &

    pid=$!
    start_time=$(ps -p "$pid" -o lstart=) || {
        log_error "DevKit exited before it could be recorded; see $LOG_FILE"
        return 1
    }
    printf '%s|%s\n' "$pid" "$start_time" > "$PID_FILE"

    log_info "DevKit launched (PID: $pid)"
}

devkit_stop() {
    local force=false
    while (( $# > 0 )); do
        case "$1" in
            -f|--force)
                force=true
                ;;
            -h|--help)
                echo "Usage: devkit stop [--force]"
                return 0
                ;;
            *)
                log_error "Unknown option: $1"
                return 2
                ;;
        esac
        shift
    done

    local pid start_time

    if [[ ! -f "$PID_FILE" ]]; then
        log_info "DevKit is not running"
        return 0
    fi

    IFS='|' read -r pid start_time < "$PID_FILE"

    if [[ "$pid" =~ ^[0-9]+$ ]] && ! kill -0 "$pid" 2>/dev/null; then
        rm -f -- "$PID_FILE"
        log_info "DevKit is not running; removed stale PID file"
        return 0
    fi

    if ! _is_devkit "$pid" "$start_time"; then
        log_error "Cannot verify DevKit process"
        return 1
    fi

    if [[ "$force" == true ]]; then
        log_warn "Force stopping DevKit (PID: $pid)"
        kill -KILL -- "-$pid" || return 1
    else
        log_info "Stopping DevKit (PID: $pid)"

        kill -TERM -- "-$pid" || return 1

        if ! wait_for_exit "$pid"; then
            if ! _is_devkit "$pid" "$start_time"; then
                log_error "Cannot verify DevKit before force kill"
                return 1
            fi

            log_warn "DevKit is not responding"
            kill -KILL -- "-$pid" || return 1
        fi
    fi

    rm -f -- "$PID_FILE"
    log_info "Stop signal sent successfully"
}

devkit_restart() {
    local force=false

    while (( $# > 0 )); do
        case "$1" in
            -f|--force)
                force=true
                ;;
            -h|--help)
                echo "Usage: devkit restart [--force]"
                return 0
                ;;
            *)
                log_error "Unknown option: $1"
                return 2
                ;;
        esac
        shift
    done

    log_info "Restarting GNOME Shell DevKit..."

    if [[ "$force" == true ]]; then
        devkit_stop --force || return 1
    else
        devkit_stop || return 1
    fi

    devkit_start || return 1

    log_info "DevKit restart requested"
}

devkit_status() {
    :
}


devkit_logs() {
    :
}

usage() {
    cat <<EOF
    Usage: devkit <command> 

    Commands:
      start:        Start GNOME Shell devkit
      stop:         Stop running devkit
      restart:      Restart GNOME Shell devkit
      status:       Show devkit status
      logs:         Show devkit logs
      help:         Show this help message
EOF
}

main() {
    local command="${1:-help}"

    if (( $# > 0 )); then
        shift
    fi


    case "$command" in
        start)
            devkit_start 
            ;;
        stop)
            devkit_stop "$@"
            ;;
        restart)
            devkit_restart
            ;;
        status)
            devkit_status
            ;;
        logs)
            devkit_logs
            ;;
        help|-h|--help)
            usage
            ;;
        *)
            log_error "Unknown command: $command"
            usage >&2
            return 1
            ;;
    esac
}

main "$@"
