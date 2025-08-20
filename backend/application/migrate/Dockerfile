# Migration Dockerfile
FROM postgres:15-alpine

# Install bash (needed for our migration script)
RUN apk add --no-cache bash

# Copy migration files
COPY *.sql /migrations/
COPY migrate.sh /migrations/

# Set working directory
WORKDIR /migrations

# Make script executable
RUN chmod +x migrate.sh

# Run migrations
CMD ["./migrate.sh"]
