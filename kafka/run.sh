#!/bin/bash
set -e

# Generate a default Cluster ID if not provided
if [ -z "$CLUSTER_ID" ]; then
    export CLUSTER_ID="MkU3OEVBNTcwNTJENDM2Qk"
fi

# Detect Advertised Listener host and port
# On Railway, RAILWAY_PRIVATE_DOMAIN is defined for private internal networking.
# If external TCP Proxy is used, user sets KAFKA_ADVERTISED_HOST & KAFKA_ADVERTISED_PORT.
if [ -n "$KAFKA_ADVERTISED_HOST" ] && [ -n "$KAFKA_ADVERTISED_PORT" ]; then
    ADVERTISED_LISTENERS="PLAINTEXT://${KAFKA_ADVERTISED_HOST}:${KAFKA_ADVERTISED_PORT}"
elif [ -n "$RAILWAY_PRIVATE_DOMAIN" ]; then
    ADVERTISED_LISTENERS="PLAINTEXT://${RAILWAY_PRIVATE_DOMAIN}:9092"
elif [ -z "$KAFKA_ADVERTISED_LISTENERS" ]; then
    ADVERTISED_LISTENERS="PLAINTEXT://localhost:9092"
else
    ADVERTISED_LISTENERS="$KAFKA_ADVERTISED_LISTENERS"
fi

export KAFKA_ADVERTISED_LISTENERS="$ADVERTISED_LISTENERS"

echo "=== Starting Kafka ==="
echo "Node ID: ${KAFKA_NODE_ID:-1}"
echo "Advertised Listeners: ${KAFKA_ADVERTISED_LISTENERS}"

# Delegate to Apache's standard launch script
exec /etc/kafka/docker/run
