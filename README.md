# 🧬 AlphaGenome - AI-Powered Genomic Analysis Platform

A professional web-based application for genomic sequence analysis **inspired by Google DeepMind's AlphaGenome** and powered by **Google Gemini AI**.

![AlphaGenome](https://img.shields.io/badge/AlphaGenome-v1.0.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-cyan)
![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🧬 About

This project is inspired by [Google DeepMind's AlphaGenome](https://deepmind.google/discover/blog/alphagenome-ai-for-better-understanding-the-genome/), a groundbreaking AI model for genome-wide activity prediction. While the original AlphaGenome model is not publicly available, this web application uses **Google Gemini AI** to provide similar genomic analysis capabilities including:

- Gene expression prediction (RNA-seq)
- Chromatin accessibility (DNase, ATAC-seq)
- Transcription factor binding (ChIP-seq)
- Splice site prediction
- Variant effect analysis
- In silico mutagenesis (ISM)

## ✨ Features

- 🧬 **Gene Prediction** - Identify potential genes and coding regions in DNA sequences
- 🔬 **Sequence Annotation** - Detailed functional annotations of genomic sequences
- 🧪 **Protein Structure Prediction** - Predict 3D protein structures from amino acid sequences
- 📊 **Variant Analysis** - Analyze genetic variations and their impacts
- 🧫 **Chromatin Accessibility** - DNase-seq and ATAC-seq predictions
- 🔗 **Transcription Factor Binding** - ChIP-seq predictions for histone marks and TFs
- ✂️ **Splice Site Detection** - Identify donor/acceptor splice sites
- 🧪 **In Silico Mutagenesis** - Systematic mutation analysis for motif discovery
- 🎨 **Professional UI** - Modern, responsive interface with gradient animations
- 🚀 **Real-time Analysis** - Fast AI-powered genomic analysis using **Google Gemini AI**
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔐 **Secure API Key Management** - Configure your own API key through the settings page

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI Engine**: **Google Gemini AI API** (inspired by DeepMind's AlphaGenome)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Gemini API Key (free tier available)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to the project directory
cd Alphagenome

# Install dependencies
npm install
```

### 2. Get Your Free Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIzaSy...`)

### 3. Configure API Key

**Option A: Using the Settings Page (Recommended for local use)**
1. Start the development server: `npm run dev`
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. Click "⚙️ Settings" button
4. Paste your API key and click "Save"

**Option B: Using Environment Variables**
1. Create a `.env.local` file in the root directory:
   ```bash
   ALPHAGENOME_API_KEY=your_api_key_here
   ```
2. Replace `your_api_key_here` with your actual API key

### 4. Run the Application

```bash
# Start development server
npm run dev

# Or use the Windows batch file
start.bat
```

### 5. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Performing Genomic Analysis

1. **Select Analysis Type**: Choose from four analysis modes:
   - **Gene Prediction**: Identify genes and coding regions
   - **Sequence Annotation**: Functional annotations and regulatory elements
   - **Protein Structure**: Predict protein structures and domains
   - **Variant Analysis**: Analyze mutations and their impacts

2. **Enter Sequence**: Input your DNA/RNA/Protein sequence
   - DNA: Use A, T, G, C
   - RNA: Use A, U, G, C
   - Protein: Use standard amino acid codes

3. **Analyze**: Click "Analyze Sequence"

4. **View Results**: Get detailed AI-powered insights

### Example Sequences

**DNA Sequence (Gene Prediction)**:
```
ATGCGATACGCTTGAGATTACGATGCTAGCTACGATCGTAGCTAGCTAGCTAGCATCGATCGATCGTAGCTAGCTAGCTAGC
```

**Protein Sequence (Structure Prediction)**:
```
MKTIIALSYIFCLVFADYKDDDDK
```

**Variant Analysis**:
```
Reference: ATGCGAT
Variant: ATGGAT (G→G substitution)
```

## 🏗️ Project Structure

```
alphagenome/
├── app/
│   ├── api/
│   │   └── genome/
│   │       └── analyze/
│   │           └── route.ts      # API endpoint for genome analysis
│   ├── settings/
│   │   └── page.tsx              # Settings & API key configuration
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main analysis interface
├── components/
│   ├── SequenceVisualizer.tsx    # DNA/RNA sequence visualization
│   └── VariantReport.tsx         # Variant analysis reports
├── lib/
│   └── alphagenome.ts            # Gemini API client wrapper
├── styles/
│   └── globals.css               # Global styles and animations
├── public/                       # Static assets
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## 🎨 Features in Detail

### Analysis Types

1. **Gene Prediction**
   - Identifies open reading frames (ORFs)
   - Predicts coding sequences (CDS)
   - Detects promoter regions
   - Finds splice sites

2. **Sequence Annotation**
   - Functional element identification
   - Regulatory region detection
   - Binding site prediction
   - Motif discovery

3. **Protein Structure**
   - Secondary structure prediction (α-helix, β-sheet)
   - Domain identification
   - Functional site detection
   - 3D structure insights

4. **Variant Analysis**
   - SNP analysis
   - Mutation impact assessment
   - Pathogenicity prediction
   - Conservation analysis

### UI/UX Features

- ✨ Animated gradient backgrounds
- 🎯 Real-time loading indicators
- ⚡ Fast, client-side sequence visualization
- 📱 Mobile-responsive design
- 🎨 Color-coded nucleotide display
- 🔐 Secure local API key storage

## 🔧 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build optimized production bundle
npm run start    # Start production server
npm run lint     # Run ESLint for code quality
```

## 🌐 API Reference

### POST `/api/genome/analyze`

Analyze a genomic sequence using Google Gemini AI.

**Request Body**:
```typescript
{
  sequence: string;      // DNA/RNA/Protein sequence
  analysisType: 'prediction' | 'annotation' | 'structure' | 'variation';
}
```

**Response**:
```typescript
{
  success: boolean;
  predictions?: Array<{
    type: string;
    start: number;
    end: number;
    sequence: string;
    confidence: number;
    details: string;
  }>;
  data?: {
    analysis: string;
    features: string[];
    recommendations: string[];
  };
  error?: string;
}
```

## 🔐 Security & Privacy

- ✅ API keys stored locally in browser (localStorage)
- ✅ No data sent to third-party servers
- ✅ Direct API calls to Google Gemini
- ✅ Environment variables for server-side keys
- ⚠️ Never commit `.env.local` to version control

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable:
   - Key: `ALPHAGENOME_API_KEY`
   - Value: Your Gemini API key
4. Deploy!

### Build for Production

```bash
npm run build
npm run start
```

## 📚 Resources

- [Google DeepMind's AlphaGenome](https://deepmind.google/discover/blog/alphagenome-ai-for-better-understanding-the-genome/)
- [Google Gemini AI Documentation](https://ai.google.dev/gemini-api/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Genomics Primer](https://www.genome.gov/about-genomics)

## 🙏 Acknowledgments

- **Google DeepMind** for the AlphaGenome research that inspired this project
- **Google Gemini AI Team** for providing the AI capabilities that power the analysis
- Next.js Team for the amazing framework
- Tailwind CSS for beautiful styling
- Lucide Icons for the icon set
- The open-source community

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### "API Key Required" Error
- Go to Settings page and configure your Gemini API key
- Or add `ALPHAGENOME_API_KEY` to `.env.local`

### "Invalid Sequence" Error
- Ensure DNA sequences only contain A, T, G, C
- Ensure RNA sequences only contain A, U, G, C
- Remove any spaces or special characters

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

## 📚 Resources

- [Google DeepMind's AlphaGenome](https://deepmind.google/discover/blog/alphagenome-ai-for-better-understanding-the-genome/)
- [Google Gemini AI Documentation](https://ai.google.dev/gemini-api/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Genomics Primer](https://www.genome.gov/about-genomics)

## 🙏 Acknowledgments

- **Google DeepMind** for the AlphaGenome research that inspired this project
- **Google Gemini AI Team** for providing the AI capabilities that power the analysis
- Next.js Team for the amazing framework
- Tailwind CSS for beautiful styling
- Lucide Icons for the icon set
- The open-source community

---

**⚠️ Disclaimer**: This tool is for educational and research purposes. It is inspired by but not affiliated with Google DeepMind's AlphaGenome. Always validate results with established bioinformatics tools and consult with genomics professionals for clinical applications.

**Built with ❤️ using Next.js, TypeScript, and Google Gemini AI | Inspired by Google DeepMind's AlphaGenome**