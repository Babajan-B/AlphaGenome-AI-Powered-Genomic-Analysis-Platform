# AlphaGenome Python Backend

This is the Python backend server that connects to the **real Google DeepMind AlphaGenome API**.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Get your AlphaGenome API key from Google AI Studio:
   - Visit: https://aistudio.google.com/app/apikey
   - Create an API key
   - Save it to use in your frontend settings

## Running the Server

Start the FastAPI server:
```bash
python main.py
```

The server will run on: http://localhost:8000

## API Endpoints

- `GET /` - Health check
- `POST /api/analyze` - Analyze genomic data using real AlphaGenome API

## Architecture

```
Next.js Frontend (localhost:3000)
        ↓
Next.js API Route (/api/genome/analyze)
        ↓
Python FastAPI Backend (localhost:8000)
        ↓
Real AlphaGenome API (Google DeepMind)
```

## Testing

Once the server is running, test it with:
```bash
curl http://localhost:8000
```

You should see:
```json
{
  "message": "AlphaGenome API Server",
  "status": "running",
  "alphagenome_available": true
}
