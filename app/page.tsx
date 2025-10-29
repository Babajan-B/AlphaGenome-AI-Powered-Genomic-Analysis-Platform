'use client'

import { useState } from 'react'
import { Dna, Sparkles, Search, Loader2, Download, Share2, AlertCircle, Copy, Check, Beaker, MapPin, Activity, Settings } from 'lucide-react'
import VariantReport from '@/components/VariantReport'
import Link from 'next/link'

// Enhanced examples based on real AlphaGenome notebooks
const EXAMPLES = {
  sequence_prediction: {
    name: 'Sequence Prediction (DNase, RNA-seq)',
    sequence: 'GATTACA',
    description: 'Predict multiple output types for a DNA sequence',
    mode: 'sequence',
    outputTypes: ['DNASE', 'RNA_SEQ'],
    ontologyTerms: ['UBERON:0002048'] // Lung
  },
  interval_analysis: {
    name: 'Genomic Interval (CYP2B6 gene)',
    interval: { chromosome: 'chr19', start: 41349443, end: 41375443 },
    description: 'Analyze 1MB region around CYP2B6 gene',
    mode: 'interval',
    outputTypes: ['RNA_SEQ'],
    ontologyTerms: ['UBERON:0001114'] // Right liver lobe
  },
  variant_effect: {
    name: 'Variant Effect Prediction',
    variant: { chromosome: 'chr22', position: 36201698, reference_bases: 'A', alternate_bases: 'C' },
    interval: { chromosome: 'chr22', start: 35701698, end: 36701698 },
    description: 'Predict REF vs ALT allele effects',
    mode: 'variant',
    outputTypes: ['RNA_SEQ'],
    ontologyTerms: ['UBERON:0001157'] // Colon
  },
  variant_scoring: {
    name: 'Variant Scoring (Multiple Scorers)',
    variant: { chromosome: 'chr22', position: 36201698, reference_bases: 'A', alternate_bases: 'C' },
    interval: { chromosome: 'chr22', start: 35701698, end: 36701698 },
    description: 'Score variant with RNA-seq, CAGE, Splice scorers',
    mode: 'score_variant'
  },
  ism_analysis: {
    name: 'In Silico Mutagenesis (ISM)',
    sequence: 'ATGCGATACGCTTGAGATTACGATGCTAGCTACGATCGTAGCTAGCTAGCTAGCATCGATCGATCGTAGCTAGCTAGCTAGC',
    description: 'Systematically mutate each position to find important regions',
    mode: 'ism',
    outputTypes: ['DNASE']
  },
  mouse_prediction: {
    name: 'Mouse Genome Analysis',
    sequence: 'GATTACA',
    description: 'Predictions for mouse (Mus musculus)',
    mode: 'sequence',
    organism: 'mouse',
    outputTypes: ['DNASE'],
    ontologyTerms: ['UBERON:0002048'] // Lung
  }
}

const OUTPUT_TYPES = [
  { value: 'RNA_SEQ', label: 'RNA-seq', desc: 'Gene expression' },
  { value: 'DNASE', label: 'DNase-seq', desc: 'DNA accessibility' },
  { value: 'ATAC', label: 'ATAC-seq', desc: 'Open chromatin' },
  { value: 'CAGE', label: 'CAGE', desc: 'Transcription start sites' },
  { value: 'CHIP_HISTONE', label: 'ChIP-seq (Histone)', desc: 'Histone modifications' },
  { value: 'CHIP_TF', label: 'ChIP-seq (TF)', desc: 'TF binding' },
  { value: 'PROCAP', label: 'PRO-cap', desc: 'Nascent transcription' },
  { value: 'SPLICE_SITES', label: 'Splice Sites', desc: 'Splicing signals' },
  { value: 'SPLICE_SITE_USAGE', label: 'Splice Site Usage', desc: 'Alternative splicing' },
  { value: 'SPLICE_JUNCTIONS', label: 'Splice Junctions', desc: 'Splicing junctions' },
  { value: 'CONTACT_MAPS', label: 'Contact Maps', desc: '3D genome organization' },
]

const TISSUE_ONTOLOGIES = [
  { value: 'UBERON:0002048', label: 'Lung' },
  { value: 'UBERON:0000955', label: 'Brain' },
  { value: 'UBERON:0001114', label: 'Right liver lobe' },
  { value: 'UBERON:0001157', label: 'Colon - Transverse' },
  { value: 'UBERON:0002107', label: 'Liver' },
  { value: 'UBERON:0000948', label: 'Heart' },
  { value: 'EFO:0002067', label: 'K562 cell line' },
  { value: 'CL:0000084', label: 'T-cell' },
]

export default function Home() {
  const [mode, setMode] = useState<'sequence' | 'interval' | 'variant' | 'score_variant' | 'ism'>('sequence')
  const [sequence, setSequence] = useState('')
  const [interval, setInterval] = useState({ chromosome: 'chr19', start: 41349443, end: 41375443 })
  const [variant, setVariant] = useState({ chromosome: 'chr22', position: 36201698, reference_bases: 'A', alternate_bases: 'C' })
  const [organism, setOrganism] = useState<'human' | 'mouse'>('human')
  const [selectedOutputTypes, setSelectedOutputTypes] = useState<string[]>(['DNASE', 'RNA_SEQ'])
  const [selectedTissues, setSelectedTissues] = useState<string[]>(['UBERON:0002048'])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showVisualReport, setShowVisualReport] = useState(false)

  // Auto-update interval when variant chromosome or position changes
  const updateVariant = (updates: Partial<typeof variant>) => {
    const newVariant = { ...variant, ...updates }
    setVariant(newVariant)
    
    // Auto-calculate interval: ±524,288 bp around variant position (total 1,048,576 bp)
    // This is the exact supported length for AlphaGenome (2^20)
    if (newVariant.position && newVariant.chromosome) {
      const windowSize = 524288 // Half of 1,048,576 (the supported 1MB length)
      setInterval({
        chromosome: newVariant.chromosome,
        start: Math.max(1, newVariant.position - windowSize),
        end: newVariant.position + windowSize
      })
    }
  }

  const handleAnalyze = async () => {
    if (mode === 'sequence' && !sequence.trim()) {
      setError('Please enter a genomic sequence')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)
    setShowVisualReport(false)

    // Check for API key
    const apiKey = localStorage.getItem('alphagenome_api_key')
    if (!apiKey) {
      setError('API Key not configured. Please go to Settings to add your AlphaGenome API key.')
      setLoading(false)
      return
    }

    try {
      const requestBody: any = {
        analysisType: mode,
        organism,
        outputTypes: selectedOutputTypes,
        ontologyTerms: selectedTissues,
        apiKey // Pass API key from localStorage
      }

      if (mode === 'sequence' || mode === 'ism') {
        requestBody.sequence = sequence
      } else if (mode === 'interval') {
        requestBody.interval = interval
      } else if (mode === 'variant' || mode === 'score_variant') {
        // For variant analysis, ensure interval is exactly 1,048,576 bp (2^20)
        const windowSize = 524288 // Half of 1,048,576
        const variantInterval = {
          chromosome: variant.chromosome,
          start: Math.max(1, variant.position - windowSize),
          end: variant.position + windowSize
        }
        requestBody.variant = variant
        requestBody.interval = variantInterval
        
        console.log('Sending interval:', variantInterval, 'Length:', variantInterval.end - variantInterval.start)
      }

      const response = await fetch('/api/genome/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data)
        if (mode === 'variant' || mode === 'score_variant') {
          setShowVisualReport(true)
        }
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = (key: keyof typeof EXAMPLES) => {
    const example = EXAMPLES[key]
    setMode(example.mode as any)
    
    // Type-safe property checks
    if ('sequence' in example && example.sequence) {
      setSequence(example.sequence)
    }
    if ('interval' in example && example.interval) {
      setInterval(example.interval)
    }
    if ('variant' in example && example.variant) {
      setVariant(example.variant)
    }
    if ('organism' in example && example.organism) {
      setOrganism(example.organism as any)
    }
    if ('outputTypes' in example && example.outputTypes) {
      setSelectedOutputTypes(example.outputTypes)
    }
    if ('ontologyTerms' in example && example.ontologyTerms) {
      setSelectedTissues(example.ontologyTerms)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadResults = () => {
    if (!results) return
    const text = results.predictions?.map((pred: any) => 
      pred.content?.parts?.map((part: any) => part.text).join('\n')
    ).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alphagenome-${mode}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadFullReport = () => {
    const reportWindow = window.open('', '_blank')
    if (reportWindow) {
      reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AlphaGenome Variant Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #7c3aed; }
            </style>
          </head>
          <body>
            ${document.getElementById('variant-report-container')?.innerHTML || ''}
          </body>
        </html>
      `)
      reportWindow.document.close()
      reportWindow.print()
    }
  }

  const toggleOutputType = (type: string) => {
    setSelectedOutputTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleTissue = (tissue: string) => {
    setSelectedTissues(prev => 
      prev.includes(tissue) ? prev.filter(t => t !== tissue) : [...prev, tissue]
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Dna className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                AlphaGenome
              </h1>
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-xl font-semibold text-white">
              AI-Powered Genomic Predictions by Google DeepMind
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Predict DNase, RNA-seq, CAGE, ATAC, ChIP-seq, Splicing & More
            </p>
          </div>
          <Link 
            href="/settings"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>

        {/* Quick Examples */}
        <div className="mb-6 bg-white/95 rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Beaker className="w-4 h-4 text-purple-600" />
            Quick Start Examples
          </h3>
          <div className="grid md:grid-cols-3 gap-2">
            {Object.entries(EXAMPLES).map(([key, example]) => (
              <button
                key={key}
                onClick={() => loadExample(key as keyof typeof EXAMPLES)}
                className="text-left p-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-lg border border-purple-200 hover:border-purple-400 transition-all text-xs"
              >
                <div className="font-bold text-gray-900 mb-1">{example.name}</div>
                <div className="text-gray-600">{example.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Show Visual Report for Variant Analysis */}
        {showVisualReport && results && (mode === 'variant' || mode === 'score_variant') ? (
          <div id="variant-report-container" className="mb-8">
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={() => setShowVisualReport(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-semibold"
              >
                ← Back to Input
              </button>
              <button
                onClick={downloadFullReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
            <VariantReport variantData={results} onDownload={downloadFullReport} />
          </div>
        ) : (
          <>
            {/* Main Analysis Interface */}
            <div className="bg-white/95 rounded-2xl shadow-2xl p-6 border border-gray-200">
              {/* Analysis Mode Selector */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-2">Analysis Mode</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'sequence', label: '🧬 Sequence', icon: Dna },
                    { value: 'interval', label: '📍 Interval', icon: MapPin },
                    { value: 'variant', label: '🔬 Variant', icon: Activity },
                    { value: 'score_variant', label: '📊 Score', icon: Activity },
                    { value: 'ism', label: '⚗️ ISM', icon: Beaker },
                  ].map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value as any)}
                      className={`p-3 rounded-lg font-bold text-sm transition-all ${
                        mode === m.value
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Panel - Input */}
                <div className="space-y-4">
                  {/* Organism Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Organism</label>
                    <select
                      value={organism}
                      onChange={(e) => setOrganism(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-semibold text-sm"
                    >
                      <option value="human">🧍 Human (Homo sapiens - hg38)</option>
                      <option value="mouse">🐭 Mouse (Mus musculus - mm10)</option>
                    </select>
                  </div>

                  {/* Dynamic Input based on mode */}
                  {(mode === 'sequence' || mode === 'ism') && (
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">DNA Sequence</label>
                      <textarea
                        value={sequence}
                        onChange={(e) => setSequence(e.target.value.toUpperCase())}
                        placeholder="Enter DNA sequence (A, T, G, C)..."
                        className="w-full h-32 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-mono text-xs font-bold"
                      />
                      <p className="text-xs text-gray-600 mt-1">Length: {sequence.length} bp</p>
                    </div>
                  )}

                  {mode === 'interval' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">Genomic Interval</label>
                      <input
                        type="text"
                        placeholder="Chromosome (e.g., chr19)"
                        value={interval.chromosome}
                        onChange={(e) => setInterval({...interval, chromosome: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Start position"
                          value={interval.start}
                          onChange={(e) => setInterval({...interval, start: parseInt(e.target.value)})}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                        />
                        <input
                          type="number"
                          placeholder="End position"
                          value={interval.end}
                          onChange={(e) => setInterval({...interval, end: parseInt(e.target.value)})}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {(mode === 'variant' || mode === 'score_variant') && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-800">Variant Details</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Chromosome"
                          value={variant.chromosome}
                          onChange={(e) => updateVariant({ chromosome: e.target.value })}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                        />
                        <input
                          type="number"
                          placeholder="Position"
                          value={variant.position}
                          onChange={(e) => updateVariant({ position: parseInt(e.target.value) })}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="REF allele"
                          value={variant.reference_bases}
                          onChange={(e) => updateVariant({ reference_bases: e.target.value.toUpperCase() })}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="ALT allele"
                          value={variant.alternate_bases}
                          onChange={(e) => updateVariant({ alternate_bases: e.target.value.toUpperCase() })}
                          className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                        />
                      </div>
                      
                      {/* Auto-calculated Genomic Context Display */}
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          📍 Genomic Context (Auto-calculated ±524,288 bp):
                        </p>
                        <p className="text-xs text-blue-800 font-mono">
                          {variant.chromosome}:{Math.max(1, variant.position - 524288).toLocaleString()}-{(variant.position + 524288).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          ✓ Analysis will use this 1,048,576 bp region centered on your variant
                        </p>
                        <p className="text-xs text-purple-700 font-semibold mt-1">
                          Variant at position: {variant.position.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Output Types Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Output Types (Select Multiple)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                      {OUTPUT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => toggleOutputType(type.value)}
                          className={`p-2 rounded text-xs font-semibold text-left transition-all ${
                            selectedOutputTypes.includes(type.value)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-bold">{type.label}</div>
                          <div className="text-xs opacity-80">{type.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tissue/Cell Type Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Tissues/Cell Types</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                      {TISSUE_ONTOLOGIES.map((tissue) => (
                        <button
                          key={tissue.value}
                          onClick={() => toggleTissue(tissue.value)}
                          className={`p-2 rounded text-xs font-semibold transition-all ${
                            selectedTissues.includes(tissue.value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tissue.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Run AlphaGenome Analysis
                      </>
                    )}
                  </button>
                </div>

                {/* Right Panel - Results */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    Predictions
                  </h2>

                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
                    {error && (
                      <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 text-red-900 text-sm">
                        <p className="font-bold mb-1">Error</p>
                        <p>{error}</p>
                      </div>
                    )}

                    {loading && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
                        <p className="text-gray-900 font-bold">Running AlphaGenome...</p>
                        <p className="text-xs text-gray-600 mt-1">This may take a moment</p>
                      </div>
                    )}

                    {results && !loading && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-green-100 border border-green-500 rounded-full text-green-800 text-xs font-bold">
                            ✓ Complete
                          </span>
                          <div className="flex gap-2">
                            {(mode === 'variant' || mode === 'score_variant') && (
                              <button 
                                onClick={() => setShowVisualReport(true)}
                                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-semibold"
                                title="View Visual Report"
                              >
                                📊 Visual Report
                              </button>
                            )}
                            <button onClick={downloadResults} className="p-1 hover:bg-gray-200 rounded" title="Download">
                              <Download className="w-4 h-4 text-gray-700" />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(
                                results.predictions?.map((pred: any) => 
                                  pred.content?.parts?.map((part: any) => part.text).join('\n')
                                ).join('\n\n') || ''
                              )}
                              className="p-1 hover:bg-gray-200 rounded" 
                              title="Copy"
                            >
                              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-700" />}
                            </button>
                          </div>
                        </div>

                        {results.predictions && results.predictions.length > 0 && (
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-900 space-y-2">
                              {results.predictions.map((pred: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-purple-500 pl-2 py-1 bg-purple-50">
                                  {pred.content?.parts?.map((part: any, partIdx: number) => (
                                    <p key={partIdx} className="whitespace-pre-wrap font-medium leading-relaxed text-xs">{part.text}</p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!results && !loading && !error && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <Dna className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-center font-bold">Ready for Analysis</p>
                        <p className="text-center text-xs mt-1">Load an example or configure your analysis</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-5 gap-4 mt-8">
              {[
                { icon: '🧬', title: 'Sequence', desc: 'Predict from DNA' },
                { icon: '📍', title: 'Interval', desc: 'Genomic regions' },
                { icon: '🔬', title: 'Variant', desc: 'REF vs ALT' },
                { icon: '📊', title: 'Scoring', desc: 'Multi-scorer' },
                { icon: '⚗️', title: 'ISM', desc: 'Mutagenesis' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white/95 rounded-lg p-4 border border-purple-300 hover:shadow-lg transition-all text-center">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="text-sm font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 pb-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <p className="text-white text-sm mb-3">
              Developed with ❤️ by <span className="font-bold text-purple-300">Dr. Babajan Banaganapalli</span>
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-300">
              <a 
                href="mailto:b.babajaan@gmail.com" 
                className="hover:text-purple-300 transition-colors flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                📧 b.babajaan@gmail.com
              </a>
              <a 
                href="https://sa.linkedin.com/in/babajan" 
                className="hover:text-purple-300 transition-colors flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                💼 LinkedIn
              </a>
              <a 
                href="https://github.com/Babajan-B" 
                className="hover:text-purple-300 transition-colors flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                💻 GitHub
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Inspired by Google DeepMind's AlphaGenome | Powered by Google Gemini AI
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}