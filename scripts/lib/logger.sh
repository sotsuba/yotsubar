#!/bin/bash

_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log_info() {
    echo "[$(_timestamp)] [INFO] $*"
}

log_warn() {
    echo "[$(_timestamp)] [WARN] $*"
}


log_error() {
    echo "[$(_timestamp)] [ERROR] $*"
}
