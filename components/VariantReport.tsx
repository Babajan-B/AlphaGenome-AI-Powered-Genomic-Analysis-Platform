'use client'

import React, { useRef } from 'react'
import { Download, AlertCircle, Info, FileText, BarChart3, TrendingUp, Database, Dna, Activity } from 'lucide-react'

interface VariantReportProps {
  variantData: any
  onDownload?: () => void
}

export default function VariantReport({ variantData, onDownload }: VariantReportProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  // Parse real AlphaGenome data from the response
  const parseAlphaGenomeData = () => {
    try {
      const predictions = variantData?.predictions || [];
      const firstPrediction = predictions[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON data from the text response
      const jsonMatch = firstPrediction.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          variant: data.variant || 'N/A',
          interval: data.interval || 'N/A',
          intervalLength: data.interval_length || 0,
          reference: data.reference || {},
          alternate: data.alternate || {},
          outputTypes: data.output_types || [],
          timestamp: new Date().toLocaleString()
        };
      }
    } catch (e) {
      console.error('Error parsing AlphaGenome data:', e);
    }
    return null;
  };

  const alphaGenomeData = parseAlphaGenomeData();

  const downloadAsJSON = () => {
    const blob = new Blob([JSON.stringify(alphaGenomeData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `alphagenome-analysis-${Date.now()}.json`
    link.click()
  }

  if (!alphaGenomeData) {
    return (
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
        <p className="text-red-900 font-semibold">Error: Unable to parse AlphaGenome data</p>
      </div>
    );
  }

  // Get all available output types from the data
  const availableOutputTypes = Object.keys(alphaGenomeData.reference);

  return (
    <div ref={reportRef} className="bg-white rounded-lg shadow-2xl p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b-4 border-purple-600 pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Dna className="w-10 h-10 text-purple-600" />
              AlphaGenome Variant Analysis Report
            </h1>
            <p className="text-sm text-gray-500">Generated on {alphaGenomeData.timestamp} using Real AlphaGenome API</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadAsJSON}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
          </div>
        </div>
      </div>

      {/* Success Notice */}
      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">✓ Real AlphaGenome Predictions</h3>
            <p className="text-gray-700 text-sm">
              This report contains actual predictions from Google DeepMind's AlphaGenome model for {availableOutputTypes.length} output type(s): 
              <strong> {availableOutputTypes.map(t => t.toUpperCase()).join(', ')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Variant Summary Card */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Variant</p>
              <p className="text-lg font-bold text-purple-900">{alphaGenomeData.variant}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Genomic Interval</p>
              <p className="text-sm font-bold text-blue-900">{alphaGenomeData.interval}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Context Length</p>
              <p className="text-lg font-bold text-green-900">{alphaGenomeData.intervalLength.toLocaleString()} bp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Display results for EACH output type */}
      {availableOutputTypes.map((outputType) => {
        const refData = alphaGenomeData.reference[outputType];
        const altData = alphaGenomeData.alternate[outputType];
        const refShape = refData?.shape || [];
        const altShape = altData?.shape || [];
        const refMetadata = refData?.metadata || [];
        const altMetadata = altData?.metadata || [];

        return (
          <div key={outputType} className="mb-12">
            {/* Output Type Header */}
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                {outputType.toUpperCase().replace('_', '-')} Predictions
              </h2>
            </div>

            {/* Prediction Data Summary */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Reference Allele */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Reference Allele (REF)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Prediction Shape:</span>
                    <span className="text-sm font-mono bg-blue-100 px-3 py-1 rounded text-blue-900">
                      [{refShape.join(' × ')}]
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Base Pairs:</span>
                    <span className="text-sm font-bold text-gray-900">{refShape[0]?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Tracks:</span>
                    <span className="text-sm font-bold text-gray-900">{refShape[1] || 0}</span>
                  </div>
                </div>
              </div>

              {/* Alternate Allele */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Alternate Allele (ALT)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Prediction Shape:</span>
                    <span className="text-sm font-mono bg-orange-100 px-3 py-1 rounded text-orange-900">
                      [{altShape.join(' × ')}]
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Base Pairs:</span>
                    <span className="text-sm font-bold text-gray-900">{altShape[0]?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Tracks:</span>
                    <span className="text-sm font-bold text-gray-900">{altShape[1] || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Track Metadata Table */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                {outputType.toUpperCase()} Track Details
              </h3>
              
              <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Track Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Strand</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Assay Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Tissue</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Life Stage</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Data Source</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase">Mean Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refMetadata.map((track: any, idx: number) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{track.name}</td>
                          <td className="px-4 py-3 text-sm">
                            {track.strand && (
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                track.strand === '+' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {track.strand}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{track['Assay title'] || track.assay_title || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{track.biosample_name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{track.biosample_life_stage || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold uppercase">
                              {track.data_source || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">
                            {track.nonzero_mean?.toFixed(4) || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Genome Browser-style Visualization - REF vs ALT comparison */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Genome Browser View: REF vs ALT Signal Comparison
              </h3>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-purple-300">
                {refMetadata.map((track: any, idx: number) => {
                  const altTrack = altMetadata[idx];
                  const refSignal = track.nonzero_mean || 0;
                  const altSignal = altTrack?.nonzero_mean || 0;
                  const maxSignal = Math.max(refSignal, altSignal, 0.001);
                  const refWidth = (refSignal / maxSignal) * 100;
                  const altWidth = (altSignal / maxSignal) * 100;
                  const delta = altSignal - refSignal;
                  const deltaPercent = refSignal > 0 ? ((delta / refSignal) * 100).toFixed(2) : 0;

                  return (
                    <div key={idx} className="mb-6 last:mb-0 bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{track.name}</h4>
                          <p className="text-xs text-gray-600">
                            {track.biosample_name} • {track['Assay title'] || track.assay_title} • {track.strand ? `Strand: ${track.strand}` : ''}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded ${
                          delta > 0 ? 'bg-green-100 text-green-800' : delta < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {delta > 0 ? '↑' : delta < 0 ? '↓' : '='} {Math.abs(Number(deltaPercent))}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {/* REF bar */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-600 w-12">REF:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-3 transition-all"
                              style={{ width: `${refWidth}%`, minWidth: refWidth > 0 ? '50px' : '0' }}
                            >
                              <span className="text-xs font-bold text-white">{refSignal.toFixed(4)}</span>
                            </div>
                          </div>
                        </div>

                        {/* ALT bar */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-600 w-12">ALT:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-full flex items-center justify-end pr-3 transition-all"
                              style={{ width: `${altWidth}%`, minWidth: altWidth > 0 ? '50px' : '0' }}
                            >
                              <span className="text-xs font-bold text-white">{altSignal.toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="my-8 border-2 border-gray-300" />
          </div>
        );
      })}

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          About This Analysis
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Model:</strong> Google DeepMind AlphaGenome (Official Python SDK)
          </p>
          <p>
            <strong>Analysis Type:</strong> Variant Effect Prediction (REF vs ALT)
          </p>
          <p>
            <strong>Output Types:</strong> {availableOutputTypes.map(t => t.toUpperCase()).join(', ')}
          </p>
          <p>
            <strong>Data Sources:</strong> Real predictions from AlphaGenome trained on ENCODE, GTEx, and other large-scale genomic datasets
          </p>
          <p>
            <strong>Prediction Resolution:</strong> Base-pair level predictions across {alphaGenomeData.intervalLength.toLocaleString()} bp
          </p>
          <p className="text-xs text-gray-600 mt-4">
            <strong>Note:</strong> These are computational predictions from the AlphaGenome model. Clinical interpretation 
            should incorporate experimental validation, family history, and phenotypic data.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-xs text-gray-600">
        <p className="mb-2">
          <strong>Disclaimer:</strong> This analysis uses the real AlphaGenome model from Google DeepMind for research and educational purposes. 
          Final clinical decisions should be made by qualified healthcare professionals using validated diagnostic 
          tools and in consultation with genetic counselors.
        </p>
        <p className="mb-2">
          <strong>Developed by:</strong> Dr. Babajan Banaganapalli
        </p>
        <p>
          <strong>Report Generated:</strong> {alphaGenomeData.timestamp} | <strong>Platform:</strong> AlphaGenome Web App v1.0.0 | <strong>Model:</strong> Real AlphaGenome API
        </p>
      </div>
    </div>
  )
}