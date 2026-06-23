# AURALYS – Hear Every Detail

AI-powered Speech Enhancement web application using SpeechBrain's SepFormer model.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js 18+ + Express |
| AI Engine | Python 3.10+ + SpeechBrain |
| Model | SepFormer WHAM 16kHz Enhancement |

## Project Structure

```
AURALYS/
├── frontend/        # React + Vite SPA
├── backend/
│   ├── src/         # Node.js Express API
│   └── engine/      # Python AI pipeline
└── README.md
```

## Quick Start

### 1. Python Engine Setup

```bash
cd backend/engine
pip install -r requirements.txt
```

> First run downloads the SpeechBrain SepFormer model (~150 MB) automatically.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm start
# Runs on http://localhost:3001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Usage

1. Open **http://localhost:5173**
2. Click **Upload Audio File** or drag & drop a `.wav`, `.mp3`, or `.opus` file
3. Preview the original recording
4. Configure enhancement settings (model, noise reduction level)
5. Click **Enhance Speech**
6. Compare original vs enhanced audio
7. Download the enhanced `.wav` file

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/enhancement/upload` | Upload + enhance audio |
| GET | `/api/enhancement/output/:jobId` | Stream/download enhanced file |
| GET | `/api/enhancement/status/:jobId` | Check job status |
| GET | `/api/enhancement/models` | List available models |
| GET | `/api/history` | Get last 6 history entries |
| DELETE | `/api/history/:id` | Delete history entry |

## Adding a New Enhancement Model

1. Create `backend/engine/models/your_model/adapter.py` implementing `BaseEnhancementModel`
2. Add entry to `MODEL_REGISTRY` in `backend/engine/config.py`
3. Register the adapter in `backend/engine/models/model_manager.py`

No changes to preprocessing, postprocessing, or the API layer are needed.

## Supported Formats

- Input: `.wav`, `.mp3`, `.opus` (max 100 MB)
- Output: `.wav` (PCM 16-bit, 16 kHz)

## Requirements

- Node.js 18+
- Python 3.10+
- ffmpeg (for .mp3 and .opus decoding via pydub/librosa)
- 4 GB RAM (for model loading)



