'use client'

import React, { useRef, useState } from 'react'
import { Download, AlertCircle, Info, FileText, Database, Dna, Activity, Table2, FileSpreadsheet, ChevronDown, ChevronUp, LineChart } from 'lucide-react'

interface VariantReportProps {
  variantData: any
  onDownload?: () => void
}

export default function VariantReport({ variantData, onDownload }: VariantReportProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

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
    link.download = `alphagenome-variant-${Date.now()}.json`
    link.click()
  }

  const downloadTableAsCSV = (outputType: string, metadata: any[]) => {
    if (!metadata || metadata.length === 0) return;

    // Convert metadata to CSV with REF/ALT comparison
    const headers = ['Track', 'Tissue', 'Strand', 'Assay', 'Life_Stage', 'Data_Source', 'REF_Mean', 'ALT_Mean', 'Change_%'];
    const csvContent = [
      headers.join(','),
      ...metadata.map((track, idx) => {
        const refMean = track.nonzero_mean || 0;
        const altMean = alphaGenomeData?.alternate?.[outputType.toLowerCase()]?.metadata?.[idx]?.nonzero_mean || 0;
        const changePercent = refMean > 0 ? (((altMean - refMean) / refMean) * 100).toFixed(2) : '0';
        
        return [
          `"${track.name}"`,
          `"${track.biosample_name || 'N/A'}"`,
          track.strand || 'N/A',
          `"${track['Assay title'] || track.assay_title || 'N/A'}"`,
          track.biosample_life_stage || 'N/A',
          track.data_source || 'N/A',
          refMean.toFixed(4),
          altMean.toFixed(4),
          changePercent
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alphagenome-${outputType}-tracks-${Date.now()}.csv`;
    link.click();
  }

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
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

  // Genome Browser Track Component - Overlaid REF vs ALT (like matplotlib OverlaidTracks)
  const GenomeBrowserTrack = ({ track, refValues, altValues, trackIdx, color }: any) => {
    if (!refValues || !altValues || refValues.length === 0) return null;

    // Sample the data for visualization (show ~200 points across the interval)
    const sampleRate = Math.max(1, Math.floor(refValues.length / 200));
    const positions = Array.from({ length: Math.ceil(refValues.length / sampleRate) }, (_, i) => i * sampleRate);
    
    // Extract values for this specific track
    const refTrackValues = positions.map(pos => {
      const val = refValues[pos];
      return Array.isArray(val) ? (val[trackIdx] || 0) : 0;
    });
    
    const altTrackValues = positions.map(pos => {
      const val = altValues[pos];
      return Array.isArray(val) ? (val[trackIdx] || 0) : 0;
    });

    // Find max value for scaling
    const maxValue = Math.max(...refTrackValues, ...altTrackValues, 0.001);
    
    // Create SVG path for line chart (like matplotlib)
    const createPath = (values: number[], color: string) => {
      const points = values.map((val, idx) => {
        const x = (idx / values.length) * 100;
        const y = 100 - ((val / maxValue) * 90); // 90% of height for data, 10% padding
        return `${x},${y}`;
      }).join(' L');
      
      return `M${points}`;
    };

    const refPath = createPath(refTrackValues, '#6b7280'); // dimgrey for REF
    const altPath = createPath(altTrackValues, '#ef4444'); // red for ALT

    return (
      <div className="mb-4 bg-white rounded-lg border border-gray-300 p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-semibold text-gray-900">
            {track.biosample_name} ({track.strand || 'N/A'})
          </div>
          <div className="text-xs text-gray-600 flex gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-gray-600"></span> REF
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-1 bg-red-600"></span> ALT
            </span>
          </div>
        </div>
        
        <svg width="100%" height="80" className="bg-gray-50 rounded">
          {/* Grid lines */}
          <line x1="0" y1="90%" x2="100%" y2="90%" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2"/>
          
          {/* REF line (grey, behind) */}
          <path
            d={refPath}
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* ALT line (red, on top) */}
          <path
            d={altPath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Y-axis label */}
          <text x="2" y="15" fontSize="10" fill="#6b7280">{maxValue.toFixed(2)}</text>
          <text x="2" y="95" fontSize="10" fill="#6b7280">0</text>
        </svg>
        
        <div className="mt-1 text-xs text-gray-600">
          {track.name} • {track['Assay title'] || track.assay_title || 'N/A'}
        </div>
      </div>
    );
  };

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
            <p className="text-sm text-gray-500">Generated {alphaGenomeData.timestamp}</p>
            <p className="text-xs text-gray-500 mt-1">Based on AlphaGenome visualization methods (plot_components.OverlaidTracks)</p>
          </div>
          <button 
            onClick={downloadAsJSON}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-sm font-semibold shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
        </div>
      </div>

      {/* Success Notice */}
      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">✓ Real AlphaGenome Predictions</h3>
            <p className="text-gray-700 text-sm">
              Analysis completed for <strong>{availableOutputTypes.length}</strong> output type(s): 
              <strong> {availableOutputTypes.map(t => t.toUpperCase()).join(', ')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Variant Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
          <div className="flex items-center gap-3">
            <FileText className="w-10 h-10 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Variant</p>
              <p className="text-lg font-bold text-purple-900">{alphaGenomeData.variant}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
          <div className="flex items-center gap-3">
            <Database className="w-10 h-10 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Interval</p>
              <p className="text-sm font-bold text-blue-900">{alphaGenomeData.interval}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
          <div className="flex items-center gap-3">
            <Activity className="w-10 h-10 text-green-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Context</p>
              <p className="text-lg font-bold text-green-900">{alphaGenomeData.intervalLength.toLocaleString()} bp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Output Type Sections */}
      {availableOutputTypes.map((outputType) => {
        const refData = alphaGenomeData.reference[outputType];
        const altData = alphaGenomeData.alternate[outputType];
        const refShape = refData?.shape || [];
        const refMetadata = refData?.metadata || [];
        const altMetadata = altData?.metadata || [];
        const refValues = refData?.values_sample || [];
        const altValues = altData?.values_sample || [];
        
        const isExpanded = expandedSections[outputType];
        const numTracks = refShape[1] || 0;

        // Calculate summary statistics
        const avgRefSignal = refMetadata.reduce((sum: number, t: any) => sum + (t.nonzero_mean || 0), 0) / (refMetadata.length || 1);
        const avgAltSignal = altMetadata.reduce((sum: number, t: any) => sum + (t.nonzero_mean || 0), 0) / (altMetadata.length || 1);
        const overallChange = avgRefSignal > 0 ? (((avgAltSignal - avgRefSignal) / avgRefSignal) * 100).toFixed(1) : '0';

        return (
          <div key={outputType} className="mb-8">
            {/* Section Header */}
            <div 
              onClick={() => toggleSection(outputType)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <LineChart className="w-7 h-7" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {outputType.toUpperCase().replace('_', '-')} Predictions
                    </h2>
                    <p className="text-sm opacity-90">
                      {numTracks} tracks • {refShape[0]?.toLocaleString() || 0} bp resolution
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-white mr-4">
                    <p className="text-xs opacity-80">Overall Impact</p>
                    <p className={`text-xl font-bold ${Number(overallChange) > 0 ? 'text-green-300' : Number(overallChange) < 0 ? 'text-red-300' : 'text-white'}`}>
                      {Number(overallChange) > 0 ? '↑' : Number(overallChange) < 0 ? '↓' : ''} {Math.abs(Number(overallChange))}%
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
              <div className="bg-gray-50 rounded-b-xl p-6 border-2 border-gray-300 border-t-0">
                {/* Genome Browser Tracks - REF vs ALT Overlaid */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-purple-600" />
                      Genome Browser View (REF vs ALT)
                    </h3>
                    <p className="text-xs text-gray-600">
                      Showing {Math.min(5, numTracks)} of {numTracks} tracks • AlphaGenome OverlaidTracks style
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-4 italic">
                      📊 Visualization mimics AlphaGenome's plot_components.OverlaidTracks() - REF (grey) and ALT (red) predictions overlaid on same axes
                    </p>
                    
                    {refMetadata.slice(0, 5).map((track: any, idx: number) => (
                      <GenomeBrowserTrack
                        key={idx}
                        track={track}
                        refValues={refValues}
                        altValues={altValues}
                        trackIdx={idx}
                        color="#3b82f6"
                      />
                    ))}

                    {numTracks > 5 && (
                      <p className="text-xs text-gray-600 text-center mt-4">
                        + {numTracks - 5} more tracks available (expand table to see all)
                      </p>
                    )}
                  </div>
                </div>

                {/* Data Table with Download */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Table2 className="w-5 h-5 text-purple-600" />
                      Complete Track Metadata ({numTracks} tracks)
                    </h3>
                    <button
                      onClick={() => downloadTableAsCSV(outputType, refMetadata)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-semibold transition-all"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-10">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-bold">#</th>
                            <th className="px-3 py-2 text-left text-xs font-bold">Track Name</th>
                            <th className="px-3 py-2 text-left text-xs font-bold">Tissue</th>
                            <th className="px-3 py-2 text-left text-xs font-bold">Strand</th>
                            <th className="px-3 py-2 text-left text-xs font-bold">Assay</th>
                            <th className="px-3 py-2 text-right text-xs font-bold">REF Mean</th>
                            <th className="px-3 py-2 text-right text-xs font-bold">ALT Mean</th>
                            <th className="px-3 py-2 text-right text-xs font-bold">Δ Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {refMetadata.map((track: any, idx: number) => {
                            const altTrack = altMetadata[idx];
                            const refMean = track.nonzero_mean || 0;
                            const altMean = altTrack?.nonzero_mean || 0;
                            const delta = altMean - refMean;
                            const changePercent = refMean > 0 ? ((delta / refMean) * 100).toFixed(1) : '0';

                            return (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-3 py-2 font-bold text-gray-500">{idx + 1}</td>
                                <td className="px-3 py-2 font-medium text-gray-900">{track.name}</td>
                                <td className="px-3 py-2 text-gray-700">{track.biosample_name || 'N/A'}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    track.strand === '+' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {track.strand || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-700">{track['Assay title'] || track.assay_title || 'N/A'}</td>
                                <td className="px-3 py-2 text-right font-mono font-bold text-gray-800">{refMean.toFixed(4)}</td>
                                <td className="px-3 py-2 text-right font-mono font-bold text-gray-800">{altMean.toFixed(4)}</td>
                                <td className="px-3 py-2 text-right">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    delta > 0 ? 'bg-green-100 text-green-800' : delta < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {delta > 0 ? '↑' : delta < 0 ? '↓' : '='} {Math.abs(Number(changePercent))}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    📊 {refMetadata.length} tracks • {refShape[0]?.toLocaleString()} bp × {refShape[1]} tracks = {((refShape[0] || 0) * (refShape[1] || 0)).toLocaleString()} total data points
                  </p>
                </div>
              </div>
            )}
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
          <p><strong>Model:</strong> Google DeepMind AlphaGenome (Official Python SDK)</p>
          <p><strong>Visualization:</strong> Based on alphagenome.visualization.plot_components.OverlaidTracks()</p>
          <p><strong>Reference:</strong> AlphaGenome bioRxiv 2025.06.25.661532</p>
          <p><strong>Output Types:</strong> {availableOutputTypes.map(t => t.toUpperCase()).join(', ')}</p>
          <p><strong>Resolution:</strong> Base-pair level across {alphaGenomeData.intervalLength.toLocaleString()} bp</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-xs text-gray-600">
        <p className="mb-2">
          <strong>Disclaimer:</strong> Research use only. Clinical decisions require validation by qualified professionals.
        </p>
        <p className="mb-2"><strong>Developed by:</strong> Dr. Babajan Banaganapalli</p>
        <p><strong>Generated:</strong> {alphaGenomeData.timestamp} | <strong>Platform:</strong> AlphaGenome Web App v1.0</p>
      </div>
    </div>
  )
}