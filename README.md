# SSH Gateway + Web Terminal UI (mesh.ai)

This repo contains a V1 monorepo skeleton for an SSH Gateway + Web Terminal UI.

## Overview

Mesh.ai is a web-based SSH bastion/gateway that allows users to establish SSH connections through their browser. Users provide connection details (host, username, credentials) dynamically through the web interface - no pre-configuration needed.

## Prerequisites
- Node.js 18+
- npm 9+
- Python 3.11+

## Setup

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Backend - No Configuration Required!

The backend acts as a pure SSH proxy. Users provide their own SSH credentials at connection time.

### 3) Run backend

From `apps/api`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app app run --port 8000 --debug
```

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
flask --app app run --port 8000 --debug
```

### 4) Run frontend

From repo root:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Usage

1. Click **"New Connection"** in the header
2. Enter SSH connection details:
   - Host (hostname or IP address)
   - Port (default: 22)
   - Username
   - Authentication method:
     - **Interactive** (default): Authenticate in the terminal after connecting
     - **Password**: Provide password upfront for automatic login
     - **Private Key**: Provide key path for automatic login
3. Click **"Connect"** to establish the SSH session
4. If using interactive auth, enter your password when prompted in the terminal
5. Each connection opens in a new tab

### Multi-Session Features
- **Tabs**: Each session opens in a tab - select which sessions to broadcast to
- **Split View**: Toggle to show two sessions side-by-side
- **Broadcast**: Select multiple session tabs (checkboxes) and broadcast input to all selected terminals
- **Run Command**: Execute read-only commands across selected sessions and see aggregated results

## Docs
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/SECURITY.md`