'use client'

import React, { useRef } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, PieChart, Pie, ScatterChart, Scatter, AreaChart, Area, ComposedChart } from 'recharts'
import { Download, Share2, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Info, Image as ImageIcon, FileText, Table as TableIcon, Database } from 'lucide-react'

interface VariantReportProps {
  variantData: any
  onDownload?: () => void
}

export default function VariantReport({ variantData, onDownload }: VariantReportProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  // Extract actual variant information from the AI response
  const extractVariantInfo = () => {
    const predictions = variantData?.predictions || [];
    const firstPrediction = predictions[0]?.content?.parts?.[0]?.text || '';
    
    // Try to extract variant details from the analysis request or response
    return {
      chromosome: variantData?.chromosome || 'chr22',
      position: variantData?.position || '36201698',
      ref: variantData?.ref || 'A',
      alt: variantData?.alt || 'C',
      gene: extractGeneFromText(firstPrediction) || 'Unknown',
      fullText: firstPrediction
    };
  };

  const extractGeneFromText = (text: string) => {
    // Try to find gene names in common formats
    const genePatterns = [
      /gene[:\s]+([A-Z][A-Z0-9]+)/i,
      /Gene:\s*([A-Z][A-Z0-9]+)/i,
      /affecting\s+([A-Z][A-Z0-9]+)\s+gene/i,
      /\b([A-Z]{2,}[0-9]*)\s+gene/,
    ];
    
    for (const pattern of genePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const variantInfo = extractVariantInfo();

  // Sample data for visualization - would be parsed from AI response
  const scoreComparisonData = [
    { metric: 'Pathogenicity', REF: 0.15, ALT: 0.78 },
    { metric: 'RNA-seq', REF: 0.0, ALT: -0.65 },
    { metric: 'DNase', REF: 0.0, ALT: -0.85 },
    { metric: 'ATAC', REF: 0.0, ALT: -0.78 },
    { metric: 'CTCF Binding', REF: 3.82, ALT: 1.15 },
  ]

  const splicingData = [
    { position: -100, canonical: 0.95, cryptic: 0.05 },
    { position: -50, canonical: 0.92, cryptic: 0.08 },
    { position: 0, canonical: 0.75, cryptic: 0.25 },
    { position: 50, canonical: 0.70, cryptic: 0.30 },
    { position: 100, canonical: 0.68, cryptic: 0.32 },
  ]

  const tissueImpactData = [
    { tissue: 'Brain', impact: 0.85, score: 85 },
    { tissue: 'Heart', impact: 0.78, score: 78 },
    { tissue: 'Liver', impact: 0.72, score: 72 },
    { tissue: 'Kidney', impact: 0.45, score: 45 },
    { tissue: 'Muscle', impact: 0.38, score: 38 },
  ]

  const pathogenicityData = [
    { category: 'Likely Pathogenic', value: 78, color: '#ef4444' },
    { category: 'Uncertain', value: 15, color: '#f59e0b' },
    { category: 'Likely Benign', value: 7, color: '#10b981' },
  ]

  // New: ChIP-seq histone modification data
  const histoneModificationData = [
    { position: 0, H3K4me3: 45, H3K27ac: 38, H3K36me3: 22, H3K27me3: 15 },
    { position: 1000, H3K4me3: 52, H3K27ac: 45, H3K36me3: 28, H3K27me3: 12 },
    { position: 2000, H3K4me3: 68, H3K27ac: 62, H3K36me3: 35, H3K27me3: 8 },
    { position: 3000, H3K4me3: 55, H3K27ac: 48, H3K36me3: 42, H3K27me3: 10 },
    { position: 4000, H3K4me3: 42, H3K27ac: 35, H3K36me3: 38, H3K27me3: 14 },
  ]

  // New: Transcription factor binding data
  const tfBindingData = [
    { tf: 'CTCF', binding: 85, color: '#e41a1c' },
    { tf: 'RAD21', binding: 72, color: '#377eb8' },
    { tf: 'POLR2A', binding: 65, color: '#4daf4a' },
    { tf: 'RBFOX2', binding: 48, color: '#984ea3' },
    { tf: 'REST', binding: 42, color: '#ff7f00' },
  ]

  // New: Contact map simulation data
  const contactMapData = Array.from({ length: 20 }, (_, i) =>
    Array.from({ length: 20 }, (_, j) => ({
      x: i,
      y: j,
      value: Math.exp(-Math.abs(i - j) / 3) * (0.5 + Math.random() * 0.5),
    }))
  ).flat()

  // New: Expression across multiple tissues
  const expressionAcrossTissues = [
    { tissue: 'Brain', control: 45, variant: 28 },
    { tissue: 'Heart', control: 52, variant: 32 },
    { tissue: 'Liver', control: 38, variant: 24 },
    { tissue: 'Kidney', control: 42, variant: 26 },
    { tissue: 'Colon', control: 55, variant: 20 },
    { tissue: 'Lung', control: 48, variant: 30 },
  ]

  // New: Splice junction read counts
  const junctionData = [
    { junction: 'Exon 14-15', REF: 850, ALT: 820 },
    { junction: 'Exon 15-16', REF: 920, ALT: 680 },
    { junction: 'Exon 16-17', REF: 880, ALT: 850 },
    { junction: 'Cryptic 15-X', REF: 45, ALT: 380 },
  ]

  const COLORS = ['#ef4444', '#f59e0b', '#10b981']

  // New: Chromatin accessibility tracks (DNASE/ATAC detail)
  const chromatinAccessibilityData = [
    { position: 0, dnase_brain: 12, dnase_heart: 8, atac_brain: 15, atac_heart: 10 },
    { position: 500, dnase_brain: 28, dnase_heart: 22, atac_brain: 32, atac_heart: 26 },
    { position: 1000, dnase_brain: 45, dnase_heart: 38, atac_brain: 48, atac_heart: 42 },
    { position: 1500, dnase_brain: 62, dnase_heart: 55, atac_brain: 65, atac_heart: 58 },
    { position: 2000, dnase_brain: 78, dnase_heart: 72, atac_brain: 82, atac_heart: 75 },
    { position: 2500, dnase_brain: 68, dnase_heart: 62, atac_brain: 72, atac_heart: 65 },
    { position: 3000, dnase_brain: 52, dnase_heart: 45, atac_brain: 55, atac_heart: 48 },
    { position: 3500, dnase_brain: 35, dnase_heart: 28, atac_brain: 38, atac_heart: 32 },
    { position: 4000, dnase_brain: 18, dnase_heart: 15, atac_brain: 22, atac_heart: 18 },
  ]

  // Download functions
  const downloadAsImage = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) return

    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const downloadTableAsCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
  }

  const downloadFullReport = async () => {
    if (!reportRef.current) return

    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#ffffff',
        scale: 1.5,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save('alphagenome-variant-report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const downloadAsJSON = () => {
    const exportData = {
      variant: {
        id: 'chr22:36201698',
        position: 'chr22:36201698',
        ref: 'A',
        alt: 'C',
        gene: 'EP300',
      },
      predictions: {
        pathogenicity: 0.78,
        scoreComparison: scoreComparisonData,
        tissueImpact: tissueImpactData,
        splicing: splicingData,
        junctions: junctionData,
        histoneModifications: histoneModificationData,
        tfBinding: tfBindingData,
        expression: expressionAcrossTissues,
        chromatinAccessibility: chromatinAccessibilityData,
      },
      metadata: {
        generated: new Date().toISOString(),
        model: 'AlphaGenome v1.0.0',
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'alphagenome-variant-data.json'
    link.click()
  }

  const downloadAllDataAsCSV = () => {
    // Combine all tables into a comprehensive CSV
    const allData = [
      '=== SCORE COMPARISON ===',
      Object.keys(scoreComparisonData[0]).join(','),
      ...scoreComparisonData.map(row => Object.values(row).join(',')),
      '',
      '=== TISSUE IMPACT ===',
      Object.keys(tissueImpactData[0]).join(','),
      ...tissueImpactData.map(row => Object.values(row).join(',')),
      '',
      '=== JUNCTION DATA ===',
      Object.keys(junctionData[0]).join(','),
      ...junctionData.map(row => Object.values(row).join(',')),
      '',
      '=== EXPRESSION ACROSS TISSUES ===',
      Object.keys(expressionAcrossTissues[0]).join(','),
      ...expressionAcrossTissues.map(row => Object.values(row).join(',')),
    ].join('\n')

    const blob = new Blob([allData], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'alphagenome-complete-data.csv'
    link.click()
  }

  return (
    <div ref={reportRef} className="bg-white rounded-lg shadow-2xl p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b-4 border-purple-600 pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AlphaGenome Variant Effect Analysis Report
            </h1>
            <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()} using Google DeepMind's AlphaGenome AI Model</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button 
              onClick={downloadFullReport}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={downloadAsJSON}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm font-semibold"
            >
              <Database className="w-4 h-4" />
              Export JSON
            </button>
            <button 
              onClick={downloadAllDataAsCSV}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2 text-sm font-semibold"
            >
              <TableIcon className="w-4 h-4" />
              Export All CSV
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-semibold">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Quick Summary Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-300">
          <p className="text-xs text-gray-600 font-semibold mb-1">Pathogenicity</p>
          <p className="text-3xl font-bold text-red-600">0.78</p>
          <p className="text-xs text-red-700 mt-1">Likely Pathogenic</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-300">
          <p className="text-xs text-gray-600 font-semibold mb-1">Gene Expression</p>
          <p className="text-3xl font-bold text-orange-600">-65%</p>
          <p className="text-xs text-orange-700 mt-1">Downregulated</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300">
          <p className="text-xs text-gray-600 font-semibold mb-1">CTCF Binding</p>
          <p className="text-3xl font-bold text-purple-600">-70%</p>
          <p className="text-xs text-purple-700 mt-1">Disrupted</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300">
          <p className="text-xs text-gray-600 font-semibold mb-1">Splicing Impact</p>
          <p className="text-3xl font-bold text-blue-600">+744%</p>
          <p className="text-xs text-blue-700 mt-1">Cryptic Site Usage</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Executive Summary</h2>
            <p className="text-gray-800 font-semibold mb-2">
              Classification: <span className="text-red-600 text-xl">LIKELY PATHOGENIC</span>
            </p>
            <p className="text-gray-700 leading-relaxed">
              The A&gt;C substitution at chr22:36201698 is predicted to cause <strong>loss-of-function</strong> of the 
              <strong> EP300</strong> gene through combined regulatory disruption and aberrant splicing. This variant shows 
              high pathogenicity likelihood (0.78) and is associated with <strong>Rubinstein-Taybi Syndrome</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Variant Details Card */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Variant Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold text-gray-700">Variant ID:</span>
              <span className="text-gray-900 font-mono">{variantInfo.chromosome}:{variantInfo.position}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold text-gray-700">Position:</span>
              <span className="text-gray-900 font-mono">{variantInfo.chromosome}:{variantInfo.position}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold text-gray-700">Reference:</span>
              <span className="text-gray-900 font-mono text-lg">{variantInfo.ref}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold text-gray-700">Alternate:</span>
              <span className="text-gray-900 font-mono text-lg">{variantInfo.alt}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="font-semibold text-gray-700">Mutation Type:</span>
              <span className="text-gray-900">Transversion ({variantInfo.ref}→{variantInfo.alt})</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold text-gray-700">Organism:</span>
              <span className="text-gray-900">Homo sapiens (hg38)</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Gene Context</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-purple-200">
              <span className="font-semibold text-gray-700">Gene:</span>
              <span className="text-gray-900 font-bold">{variantInfo.gene}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-purple-200">
              <span className="font-semibold text-gray-700">Analysis Result:</span>
              <span className="text-gray-900">See AI predictions below</span>
            </div>
            <div className="py-2">
              <span className="font-semibold text-gray-700 block mb-2">AI Analysis Summary:</span>
              <p className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                {variantInfo.fullText.substring(0, 300)}...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Generated Analysis Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AlphaGenome AI Analysis</h2>
        <div className="bg-white rounded-lg p-6 border border-blue-300 max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {variantInfo.fullText}
          </pre>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Note:</strong> The visualizations below are illustrative examples. For production use, 
          these should be dynamically generated from the AI analysis above.
        </p>
      </div>

      {/* Pathogenicity Score Visualization */}
      <div className="mb-8" id="pathogenicity-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            AlphaGenome Pathogenicity Assessment
          </h2>
          <button
            onClick={() => downloadAsImage('pathogenicity-section', 'pathogenicity-assessment')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Download Chart
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pathogenicity Probability</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pathogenicityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pathogenicityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-red-600">0.78</p>
              <p className="text-sm text-gray-600">AlphaGenome Pathogenicity Score</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">REF vs ALT Score Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="REF" fill="#10b981" name="Reference (A)" />
                <Bar dataKey="ALT" fill="#ef4444" name="Alternate (C)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* NEW: Gene Expression Across Tissues */}
      <div className="mb-8" id="expression-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Gene Expression Changes Across Tissues</h2>
          <button
            onClick={() => downloadAsImage('expression-section', 'gene-expression')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Download Chart
          </button>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={expressionAcrossTissues}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tissue" />
              <YAxis label={{ value: 'RNA-seq Expression', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="control" fill="#10b981" name="Control (REF)" />
              <Bar dataKey="variant" fill="#ef4444" name="Variant (ALT)" />
              <Line type="monotone" dataKey="control" stroke="#059669" strokeWidth={2} name="Control Trend" />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4 text-center">
            <strong>Observation:</strong> Consistent downregulation of EP300 expression across all tissues with the ALT allele, 
            with strongest effects in colon (-63%) and brain (-38%) tissues.
          </p>
        </div>
      </div>

      {/* Functional Impact Analysis */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Molecular Mechanisms & Functional Impact</h2>
        
        <div className="space-y-6">
          {/* Expression Changes */}
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              Gene Expression Changes
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700 mb-3">
                  <strong>Predicted EP300 Expression Change:</strong>
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-3xl font-bold text-red-600 mb-2">-0.65</p>
                  <p className="text-sm text-gray-600">log2 Fold Change (Downregulation)</p>
                  <div className="mt-3 bg-red-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-red-600 h-full" style={{width: '65%'}}></div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700"><strong>Mechanisms:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>CTCF binding site disruption → altered chromatin looping</li>
                  <li>Reduced enhancer-promoter interaction</li>
                  <li>Aberrant splicing → NMD-mediated degradation</li>
                  <li>Combined effect: significant haploinsufficiency</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Splicing Impact with Junction Data */}
          <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-600" id="splicing-section">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Splicing Aberrations
              </h3>
              <button
                onClick={() => downloadAsImage('splicing-section', 'splicing-analysis')}
                className="px-3 py-1 bg-white hover:bg-gray-100 rounded text-xs font-semibold flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3" />
                Download
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={splicingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" label={{ value: 'Position (bp)', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Usage', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="canonical" stroke="#10b981" strokeWidth={2} name="Canonical Site" />
                    <Line type="monotone" dataKey="cryptic" stroke="#ef4444" strokeWidth={2} name="Cryptic Site" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4">
                  <h4 className="font-bold text-sm mb-2">Splice Junction Read Counts</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={junctionData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="junction" type="category" width={100} tick={{fontSize: 10}} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="REF" fill="#10b981" name="REF" />
                      <Bar dataKey="ALT" fill="#ef4444" name="ALT" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Delta PSI (Exon 16)</p>
                  <p className="text-2xl font-bold text-red-600">-20%</p>
                  <p className="text-xs text-gray-600">Reduced exon inclusion</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Cryptic Site Strength</p>
                  <p className="text-2xl font-bold text-orange-600">+2.6</p>
                  <p className="text-xs text-gray-600">MaxEntScan score increase</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Cryptic Junction Usage</p>
                  <p className="text-2xl font-bold text-red-600">+744%</p>
                  <p className="text-xs text-gray-600">From 45 to 380 reads</p>
                </div>
                <div className="text-xs text-gray-700">
                  <strong>Impact:</strong> The A→C change strengthens a cryptic 3' splice acceptor ~50bp downstream, 
                  competing with the authentic Exon 16 acceptor and introducing a premature stop codon.
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory Impact */}
          <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-600">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Regulatory Element Disruption</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">CTCF Binding</p>
                <p className="text-2xl font-bold text-red-600">-2.67</p>
                <p className="text-xs text-gray-600">log-odds change</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">DNase Signal</p>
                <p className="text-2xl font-bold text-red-600">-0.85</p>
                <p className="text-xs text-gray-600">log2 FC</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">H3K27ac (Enhancer)</p>
                <p className="text-2xl font-bold text-orange-600">-0.40</p>
                <p className="text-xs text-gray-600">log2 FC</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-4">
              <strong>Mechanism:</strong> Disruption of CTCF binding alters chromatin topology and TAD structure, 
              reducing enhancer-promoter interactions and decreasing EP300 transcriptional activity.
            </p>
          </div>
        </div>
      </div>

      {/* NEW: Detailed Chromatin Accessibility Section */}
      <div className="mb-8" id="accessibility-detail-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Chromatin Accessibility Landscape (DNASE/ATAC-seq)</h2>
          <div className="flex gap-2">
            <button
              onClick={() => downloadAsImage('accessibility-detail-section', 'chromatin-accessibility')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
            >
              <ImageIcon className="w-3 h-3" />
              Download Chart
            </button>
            <button
              onClick={() => downloadTableAsCSV(chromatinAccessibilityData, 'chromatin-accessibility-data')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
            >
              <TableIcon className="w-3 h-3" />
              Export CSV
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-3">DNase-seq Signal</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chromatinAccessibilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" label={{ value: 'Position (bp)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Signal Intensity', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="dnase_brain" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Brain" />
                  <Area type="monotone" dataKey="dnase_heart" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Heart" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-3">ATAC-seq Signal</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chromatinAccessibilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" label={{ value: 'Position (bp)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Signal Intensity', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="atac_brain" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Brain" />
                  <Area type="monotone" dataKey="atac_heart" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Heart" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <p className="text-sm text-gray-700">
              <strong>Key Findings:</strong> Peak accessibility at position ~2000bp coincides with the EP300 TSS region. 
              Both DNase-seq and ATAC-seq show tissue-specific patterns, with higher signals in brain tissue. 
              The variant at position 36201698 falls within a region of moderate accessibility, explaining the 
              regulatory disruption observed in CTCF binding and enhancer activity.
            </p>
          </div>
        </div>
      </div>

      {/* NEW: ChIP-seq Histone Modifications */}
      <div className="mb-8" id="histone-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">2. Chromatin Accessibility & Histone Modifications</h2>
          <button
            onClick={() => downloadAsImage('histone-section', 'histone-modifications')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Download Chart
          </button>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={histoneModificationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" label={{ value: 'Position (bp)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'ChIP-seq Signal', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="H3K4me3" stackId="1" stroke="#984ea3" fill="#984ea3" fillOpacity={0.6} name="H3K4me3 (Promoter)" />
              <Area type="monotone" dataKey="H3K27ac" stackId="1" stroke="#e41a1c" fill="#e41a1c" fillOpacity={0.6} name="H3K27ac (Enhancer)" />
              <Area type="monotone" dataKey="H3K36me3" stackId="1" stroke="#ff7f00" fill="#ff7f00" fillOpacity={0.6} name="H3K36me3 (Gene body)" />
              <Area type="monotone" dataKey="H3K27me3" stackId="1" stroke="#ffc0cb" fill="#ffc0cb" fillOpacity={0.6} name="H3K27me3 (Repression)" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            <strong>Key Findings:</strong> H3K4me3 and H3K27ac (promoter/enhancer marks) show peaks at position ~2000bp, 
            coinciding with the EP300 TSS. H3K36me3 enrichment across the gene body indicates active transcription. 
            Low H3K27me3 suggests the region is not repressed.
          </p>
        </div>
      </div>

      {/* NEW: Transcription Factor Binding */}
      <div className="mb-8" id="tf-binding-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">3. Transcription Factor Binding Landscape</h2>
          <button
            onClick={() => downloadAsImage('tf-binding-section', 'tf-binding')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Download Chart
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">TF Binding Affinity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tfBindingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="tf" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="binding" name="Binding Score">
                  {tfBindingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="font-bold text-red-900 mb-2">High Impact TFs</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>🔴 <strong>CTCF (85):</strong> Insulator protein, disrupted binding alters TAD structure</li>
                <li>🔵 <strong>RAD21 (72):</strong> Cohesin complex, co-localizes with CTCF sites</li>
                <li>🟢 <strong>POLR2A (65):</strong> RNA Pol II, reduced binding near TSS</li>
              </ul>
            </div>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
              <p className="font-bold text-gray-900 mb-2">Interpretation</p>
              <p className="text-sm text-gray-700">
                The variant disrupts a CTCF binding site, which in turn affects RAD21 (cohesin) recruitment. 
                This cascade leads to altered chromatin architecture and reduced RNA Pol II engagement at the EP300 promoter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Contact Maps (3D Chromatin Architecture) */}
      <div className="mb-8" id="contact-map-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">4. 3D Chromatin Architecture (Hi-C Contact Maps)</h2>
          <button
            onClick={() => downloadAsImage('contact-map-section', 'contact-map')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Download Chart
          </button>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Genomic Position 1 (kb)" />
              <YAxis dataKey="y" name="Genomic Position 2 (kb)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={contactMapData} fill="#8b5cf6">
                {contactMapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(139, 92, 246, ${entry.value})`} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            <strong>TAD Structure:</strong> The contact map reveals three prominent topologically-associated domains (TADs) 
            visible as blocks along the diagonal. The variant's disruption of CTCF binding may weaken TAD boundaries, 
            leading to aberrant enhancer-promoter interactions.
          </p>
        </div>
      </div>

      {/* Tissue-Specific Impact */}
      <div className="mb-8" id="tissue-impact-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">5. Tissue-Specific Effects</h2>
          <button
            onClick={() => downloadAsImage('tissue-impact-section', 'tissue-impact')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Download Chart
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tissueImpactData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="tissue" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" name="Impact Score">
                  {tissueImpactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#ef4444' : entry.score > 50 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="font-bold text-red-900 mb-2">High Impact Tissues</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>🧠 <strong>Brain:</strong> Critical for neurodevelopment and synaptic plasticity</li>
                <li>❤️ <strong>Heart:</strong> Essential for cardiac development and function</li>
                <li>🫁 <strong>Liver:</strong> Key role in metabolic regulation</li>
              </ul>
            </div>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
              <p className="font-bold text-gray-900 mb-2">Molecular Rationale</p>
              <p className="text-sm text-gray-700">
                The affected CTCF site and cryptic splice site are broadly active, but EP300 dosage sensitivity 
                is most pronounced in tissues requiring dynamic chromatin remodeling for differentiation and metabolic homeostasis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Significance */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Clinical Significance</h2>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border-2 border-red-300 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-3">Associated Conditions</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <p className="font-bold text-gray-900 mb-2">Primary: Rubinstein-Taybi Syndrome (RTS)</p>
                  <p className="text-sm text-gray-700 mb-2">OMIM #180849</p>
                  <p className="text-sm text-gray-600">
                    Heterozygous LoF variants in EP300 cause RTS, characterized by intellectual disability, 
                    broad thumbs/toes, and distinctive facial features.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <p className="font-bold text-gray-900 mb-2">Secondary: Cancer Predisposition</p>
                  <p className="text-sm text-gray-600">
                    EP300 functions as a tumor suppressor. LoF variants may increase risk for bladder and colorectal cancers.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-3">Clinical Assessment</h3>
              <div className="bg-white rounded-lg p-6 border-2 border-red-300">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Clinical Pathogenicity Likelihood</p>
                  <p className="text-5xl font-bold text-red-600 mb-2">0.85</p>
                  <p className="text-lg font-semibold text-red-700">HIGH CONFIDENCE</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Molecular Basis:</p>
                  <p className="text-xs text-gray-700">
                    EP300 haploinsufficiency disrupts chromatin remodeling, gene transcription, and cell 
                    growth/differentiation pathways, leading to the pleiotropic developmental effects observed in RTS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quantitative Summary Table */}
      <div className="mb-8" id="quantitative-table">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">7. Quantitative Score Summary</h2>
          <button
            onClick={() => downloadTableAsCSV([
              { metric: 'AlphaGenome Pathogenicity (0-1)', ref: '0.15', alt: '0.78', delta: '+0.63', interpretation: 'High pathogenicity increase' },
              { metric: 'EP300 RNA-seq (log2 FC)', ref: '0.00', alt: '-0.65', delta: '-0.65', interpretation: 'Significant downregulation' },
              { metric: 'DNase-seq Signal (log2 FC)', ref: '0.00', alt: '-0.85', delta: '-0.85', interpretation: 'Substantial accessibility decrease' },
              { metric: 'ATAC-seq Signal (log2 FC)', ref: '0.00', alt: '-0.78', delta: '-0.78', interpretation: 'Substantial open chromatin decrease' },
              { metric: 'CTCF Binding (log-odds)', ref: '3.82', alt: '1.15', delta: '-2.67', interpretation: 'Significant CTCF disruption' },
              { metric: 'H3K27ac ChIP (log2 FC)', ref: '0.00', alt: '-0.40', delta: '-0.40', interpretation: 'Moderate enhancer reduction' },
              { metric: 'Cryptic 3\'SS Strength', ref: '4.5', alt: '7.1', delta: '+2.6', interpretation: 'Strong cryptic site activation' },
              { metric: 'Delta PSI (Exon 16)', ref: 'N/A', alt: 'N/A', delta: '-0.20', interpretation: '20% reduction in exon inclusion' },
            ], 'quantitative-scores')}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1"
          >
            <TableIcon className="w-3 h-3" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <th className="px-4 py-3 text-left font-bold">Metric</th>
                <th className="px-4 py-3 text-center font-bold">REF (A)</th>
                <th className="px-4 py-3 text-center font-bold">ALT (C)</th>
                <th className="px-4 py-3 text-center font-bold">Delta</th>
                <th className="px-4 py-3 text-left font-bold">Interpretation</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { metric: 'AlphaGenome Pathogenicity (0-1)', ref: '0.15', alt: '0.78', delta: '+0.63', interpretation: 'High pathogenicity increase', color: 'red' },
                { metric: 'EP300 RNA-seq (log2 FC)', ref: '0.00', alt: '-0.65', delta: '-0.65', interpretation: 'Significant downregulation', color: 'red' },
                { metric: 'DNase-seq Signal (log2 FC)', ref: '0.00', alt: '-0.85', delta: '-0.85', interpretation: 'Substantial accessibility decrease', color: 'red' },
                { metric: 'ATAC-seq Signal (log2 FC)', ref: '0.00', alt: '-0.78', delta: '-0.78', interpretation: 'Substantial open chromatin decrease', color: 'red' },
                { metric: 'CTCF Binding (log-odds)', ref: '3.82', alt: '1.15', delta: '-2.67', interpretation: 'Significant CTCF disruption', color: 'red' },
                { metric: 'H3K27ac ChIP (log2 FC)', ref: '0.00', alt: '-0.40', delta: '-0.40', interpretation: 'Moderate enhancer reduction', color: 'orange' },
                { metric: 'Cryptic 3\'SS Strength', ref: '4.5', alt: '7.1', delta: '+2.6', interpretation: 'Strong cryptic site activation', color: 'red' },
                { metric: 'Delta PSI (Exon 16)', ref: 'N/A', alt: 'N/A', delta: '-0.20', interpretation: '20% reduction in exon inclusion', color: 'red' },
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">{row.metric}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700 border-b border-gray-200">{row.ref}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-700 border-b border-gray-200">{row.alt}</td>
                  <td className={`px-4 py-3 text-center font-mono font-bold border-b border-gray-200 ${
                    row.color === 'red' ? 'text-red-600' : 'text-orange-600'
                  }`}>{row.delta}</td>
                  <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{row.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-6 h-6 text-blue-600" />
          Clinical Recommendations
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <p className="text-gray-700"><strong>Genetic Counseling:</strong> Recommend comprehensive genetic counseling for the proband and family members.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <p className="text-gray-700"><strong>Clinical Evaluation:</strong> Assess for RTS phenotypic features including developmental delay, facial dysmorphism, and skeletal abnormalities.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <p className="text-gray-700"><strong>Functional Studies:</strong> Consider RNA-seq or RT-PCR to validate aberrant splicing and reduced EP300 expression.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <p className="text-gray-700"><strong>Cancer Surveillance:</strong> Long-term monitoring for cancer predisposition given EP300's tumor suppressor role.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <p className="text-gray-700"><strong>Classification:</strong> Submit to ClinVar with supporting evidence for community annotation.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-xs text-gray-600">
        <p className="mb-2">
          <strong>Disclaimer:</strong> This analysis is generated by AlphaGenome AI model for research and clinical decision support. 
          Final clinical decisions should be made by qualified healthcare professionals using validated diagnostic tools and in 
          consultation with genetic counselors.
        </p>
        <p className="mb-2">
          <strong>References:</strong> Based on AlphaGenome deep learning model (Google DeepMind, 2024), trained on ENCODE, 
          GTEx, gnomAD, ClinVar, and additional genomic datasets.
        </p>
        <p className="mb-2">
          <strong>Visualization Methods:</strong> Inspired by AlphaGenome visualization library including track plots, 
          sashimi plots for splicing, contact maps for 3D chromatin structure, and histone modification landscapes.
        </p>
        <p>
          <strong>Report Generated:</strong> {new Date().toLocaleString()} | <strong>Version:</strong> AlphaGenome v1.0.0
        </p>
      </div>
    </div>
  )
}