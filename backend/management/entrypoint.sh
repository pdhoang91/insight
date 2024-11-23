#!/usr/bin/env bash
set -e

# Đợi PostgreSQL sẵn sàng
/wait-for-it.sh db:5432 -- echo "PostgreSQL is up"

# Khởi động ứng dụng
exec ./management
