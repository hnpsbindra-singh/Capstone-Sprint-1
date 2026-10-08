# Kafka on Railway Guide

This service runs Apache Kafka in KRaft mode (no ZooKeeper required) on Railway and locally.

## Local Running

```bash
cd kafka
docker compose up -d
```
- **Kafka Broker:** `localhost:9092`
- **Kafka Web UI:** `http://localhost:8085`

---

## Deploying to Railway

### 1. Railway Project Setup
1. Push this repository to GitHub.
2. In [Railway](https://railway.app), open your project and click **+ Create** -> **GitHub Repo**.
3. Select this repository.
4. Set the **Root Directory** in Railway service settings to `/kafka` (Settings -> General -> Root Directory: `/kafka`).

### 2. Environment Variables in Railway

Add the following variables to your Kafka service in Railway:

| Variable | Value | Description |
|---|---|---|
| `KAFKA_NODE_ID` | `1` | Broker ID |
| `KAFKA_HEAP_OPTS` | `-Xmx512M -Xms512M` | Limit memory usage for Railway containers |

#### Network Configuration:

**Option A: Microservices communicating INSIDE Railway (Private Network)**
If your backend services are also deployed on Railway:
- Set variable:
  ```env
  RAILWAY_PRIVATE_DOMAIN=${{RAILWAY_PRIVATE_DOMAIN}}
  ```
- Your producer and consumer services in Railway can connect to:
  ```
  ${{kafka.RAILWAY_PRIVATE_DOMAIN}}:9092
  ```

**Option B: Accessing Kafka from outside Railway (Public Internet / Local machine)**
1. In Railway Kafka service settings, go to **Networking** -> **TCP Proxy** -> Add TCP Proxy on port `9092`.
2. Railway gives you a public domain and port like `junction.proxy.rlwy.net:12345`.
3. Set variables in Railway:
   ```env
   KAFKA_ADVERTISED_HOST=junction.proxy.rlwy.net
   KAFKA_ADVERTISED_PORT=12345
   ```
4. Now external applications can connect using `junction.proxy.rlwy.net:12345`.

### 3. Persistent Storage (Important)
Kafka topics and consumer offsets will be wiped on restart unless you attach a volume:
1. In Railway Kafka service -> **Settings** -> **Volumes** -> **+ Add Volume**.
2. Mount path: `/var/lib/kafka/data`
