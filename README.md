# SSH Gateway + Web Terminal UI (mesh.ai)

This repo contains a V1 monorepo skeleton for an SSH Gateway + Web Terminal UI.

## Prerequisites
- Node.js 18+
- npm 9+
- Python 3.11+

## Setup

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Configure backend devices and credentials

Edit `apps/api/devices.yml` and set credentials via environment variables:

- `SSH_PRIVATE_KEY_PATH` for `auth_method: key`
- `SSH_PASSWORD` for `auth_method: password`

Example (POSIX):

```bash
export SSH_PRIVATE_KEY_PATH=~/.ssh/id_rsa
export SSH_PASSWORD=your_password
```

Example (Windows PowerShell):

```powershell
$env:SSH_PRIVATE_KEY_PATH="C:\\Users\\you\\.ssh\\id_rsa"
$env:SSH_PASSWORD="your_password"
```

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
- Use the left sidebar to filter devices and connect.
- Each session opens in a tab. Toggle split view to show two sessions side by side.
- Select sessions in the tabs and use Broadcast to send input to multiple terminals.
- Use “Run command across selected devices” to execute a read-only command.

## Docs
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/SECURITY.md`