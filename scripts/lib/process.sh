#!/bin/bash

wait_for_exit() {
    local pid="$1"
    local timeout="${2:-30}"
    
    for ((i = 0; i < timeout; i++)); do
        kill -0 "$pid" 2>/dev/null || return 0
        sleep 0.1
    done

    return 1
}