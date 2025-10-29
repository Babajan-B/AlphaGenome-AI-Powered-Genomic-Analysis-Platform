# 🧬 AlphaGenome - AI-Powered Genomic Analysis Platform

A professional web-based application for genomic sequence analysis **powered by the real AlphaGenome API from Google DeepMind**.

![AlphaGenome](https://img.shields.io/badge/AlphaGenome-v1.0.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-cyan)
![Python](https://img.shields.io/badge/Python-3.9+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)
![AlphaGenome SDK](https://img.shields.io/badge/AlphaGenome-Official_SDK-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 👨‍💻 Developer

**Dr. Babajan Banaganapalli**
- 📧 Email: [b.babajaan@gmail.com](mailto:b.babajaan@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/babajan](https://sa.linkedin.com/in/babajan)
- 💻 GitHub: [github.com/Babajan-B](https://github.com/Babajan-B)

---

## 🧬 About

This project uses the **official AlphaGenome Python SDK from Google DeepMind** to provide **real genomic predictions**. This is NOT a simulation - it connects directly to the actual AlphaGenome model through a Python FastAPI backend.

### Key Features:
- ✅ **Real AlphaGenome API Integration** - Uses the official Python SDK
- ✅ **Variant Effect Prediction** - REF vs ALT allele analysis
- ✅ **Gene Expression** - RNA-seq predictions across tissues
- ✅ **Chromatin Accessibility** - DNase-seq and ATAC-seq predictions
- ✅ **Transcription Factor Binding** - ChIP-seq predictions
- ✅ **Splice Site Prediction** - Donor/acceptor site detection
- ✅ **In Silico Mutagenesis (ISM)** - Systematic mutation analysis
- ✅ **Genomic Interval Analysis** - Region-based predictions

## 🏗️ Architecture

```
Next.js Frontend (Port 3000)
        ↓
Next.js API Route (/api/genome/analyze)
        ↓
Python FastAPI Backend (Port 8000)
        ↓
Real AlphaGenome SDK
        ↓
Google DeepMind's AlphaGenome Model
```

## 📋 Prerequisites

- **Node.js 18+** - For Next.js frontend
- **Python 3.9+** - For AlphaGenome backend
- **AlphaGenome API Key** - Get from Google AI Studio (free tier available)

## 🚀 Quick Start

### Step 1: Install Frontend Dependencies

```bash
cd Alphagenome
npm install
```

### Step 2: Install Python Backend Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

This installs:
- `alphagenome` - Official AlphaGenome SDK from Google DeepMind
- `fastapi` - Web framework for the Python API
- `uvicorn` - ASGI server
- `pydantic` - Data validation

### Step 3: Get Your AlphaGenome API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIzaSy...`)

### Step 4: Start the Python Backend Server

Open a terminal and run:

```bash
cd python-backend
python main.py
```

You should see:
```
Starting AlphaGenome API Server on http://localhost:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal running!**

### Step 5: Start the Next.js Frontend

Open a **new terminal** and run:

```bash
cd Alphagenome
npm run dev
```

You should see:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
```

### Step 6: Configure Your API Key

1. Open your browser and go to [http://localhost:3000](http://localhost:3000)
2. Click the **"⚙️ Settings"** button in the top right
3. Paste your API key and click **"Save API Key"**

### Step 7: Analyze Your Variant!

Now you can analyze real variants like:
- **chr19:23744665 A→G**
- **chr22:36201698 A→C**

And get **REAL AlphaGenome predictions** (not AI-generated text)!

## 📖 Usage Examples

### Variant Effect Prediction

```
Mode: 🔬 Variant
Chromosome: chr19
Position: 23744665
REF: A
ALT: G
Output Types: RNA_SEQ, DNASE
Tissue: Lung (UBERON:0002048)
```

Click **"Run AlphaGenome Analysis"** to get real predictions for how this variant affects:
- Gene expression (RNA-seq)
- DNA accessibility (DNase-seq)
- Tissue-specific effects

### Genomic Interval Analysis

```
Mode: 📍 Interval
Chromosome: chr19
Start: 41349443
End: 41375443
Output Types: RNA_SEQ
Tissue: Right liver lobe
```

### In Silico Mutagenesis

```
Mode: ⚗️ ISM
Sequence: ATGCGATACGCTTGAGATTACGATGCTAGC...
Output Types: DNASE
```

Systematically mutates each position to identify critical regions.

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Lucide React** - Icon library

### Backend
- **Python 3.12** - Programming language
- **FastAPI** - Modern Python web framework
- **AlphaGenome SDK** - Official API from Google DeepMind
- **Uvicorn** - ASGI server

## 🏗️ Project Structure

```
Alphagenome/
├── app/                          # Next.js app directory
│   ├── api/
│   │   └── genome/
│   │       └── analyze/
│   │           └── route.ts      # Forwards to Python backend
│   ├── settings/
│   │   └── page.tsx              # API key configuration
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main interface
├── components/
│   ├── SequenceVisualizer.tsx    # Sequence visualization
│   └── VariantReport.tsx         # Variant analysis reports
├── python-backend/               # Python FastAPI backend
│   ├── main.py                   # FastAPI server with AlphaGenome
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Backend documentation
├── lib/
│   └── alphagenome.ts            # (Legacy) TypeScript wrapper
├── styles/
│   └── globals.css               # Global styles
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

## 🔧 Available Scripts

### Frontend (Next.js)
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend (Python)
```bash
python main.py   # Start FastAPI server (http://localhost:8000)
```

## 🌐 API Endpoints

### Python Backend API

#### `GET /`
Health check endpoint

**Response:**
```json
{
  "message": "AlphaGenome API Server",
  "status": "running",
  "alphagenome_available": true
}
```

#### `POST /api/analyze`
Analyze genomic data using real AlphaGenome API

**Request Body:**
```json
{
  "api_key": "YOUR_API_KEY",
  "analysis_type": "variant",
  "variant": {
    "chromosome": "chr19",
    "position": 23744665,
    "reference_bases": "A",
    "alternate_bases": "G"
  },
  "interval": {
    "chromosome": "chr19",
    "start": 23244665,
    "end": 24244665
  },
  "output_types": ["RNA_SEQ", "DNASE"],
  "ontology_terms": ["UBERON:0002048"],
  "organism": "human"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": { ... },
    "alternate": { ... },
    "variant": "chr19:23744665:A>G",
    "interval": "chr19:23244665-24244665"
  },
  "message": "Analysis completed using real AlphaGenome API"
}
```

## 🔐 Security & Privacy

- ✅ API keys stored locally in browser (localStorage)
- ✅ API keys passed securely to Python backend
- ✅ Direct connection to Google's AlphaGenome API
- ✅ No data stored on servers
- ⚠️ Never commit API keys to version control

## 🚀 Deployment

### Option 1: Local Deployment

Run both servers locally:
```bash
# Terminal 1: Python Backend
cd python-backend
python main.py

# Terminal 2: Next.js Frontend
cd ..
npm run dev
```

### Option 2: Production Deployment

**Frontend (Vercel):**
1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variable: `PYTHON_BACKEND_URL=https://your-python-backend.com`
4. Deploy

**Backend (Python):**
Deploy to:
- Railway.app
- Render.com
- Google Cloud Run
- AWS Lambda

Set environment variable with your AlphaGenome API key.

## 🐛 Troubleshooting

### "Python backend not running"
**Error:** `Python backend not running. Please start it with: cd python-backend && python main.py`

**Solution:**
1. Open a new terminal
2. Navigate to `python-backend` folder
3. Run `python main.py`
4. Keep the terminal open

### "AlphaGenome package not installed"
**Solution:**
```bash
cd python-backend
pip install alphagenome
```

### "API Key Required"
**Solution:**
1. Go to Settings page
2. Paste your Google AI Studio API key
3. Click Save

### "Invalid Variant Format"
Ensure variant format is correct:
- Chromosome: chr1, chr2, ..., chrX, chrY
- Position: Integer (e.g., 23744665)
- REF/ALT: DNA bases (A, T, G, C)

### Port Already in Use
**Frontend (Port 3000):**
```bash
PORT=3001 npm run dev
```

**Backend (Port 8000):**
Edit `main.py` and change the port:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

## 📚 Resources

- [AlphaGenome Documentation](https://www.alphagenomedocs.com/)
- [AlphaGenome Quick Start Tutorial](./quick_start.ipynb)
- [Google DeepMind AlphaGenome Blog](https://deepmind.google/discover/blog/alphagenome-ai-for-better-understanding-the-genome/)
- [Google AI Studio (API Keys)](https://aistudio.google.com/app/apikey)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🙏 Acknowledgments

- **Google DeepMind** - For creating the AlphaGenome model and making it publicly available
- **Google AI Studio** - For providing free API access
- **Next.js Team** - For the amazing React framework
- **FastAPI Team** - For the modern Python web framework
- **Tailwind CSS** - For beautiful styling
- **Open Source Community** - For continuous inspiration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for **educational and research purposes**. It uses the official AlphaGenome API from Google DeepMind. Always validate results with established bioinformatics tools and consult with genomics professionals for clinical applications.

---

**Built with ❤️ by Dr. Babajan Banaganapalli**

**Powered by Google DeepMind's AlphaGenome | Next.js | FastAPI | Python**

---

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Python Backend README](python-backend/README.md)
3. Open an issue on GitHub
4. Contact: [b.babajaan@gmail.com](mailto:b.babajaan@gmail.com)