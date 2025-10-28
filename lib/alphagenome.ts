import axios from 'axios';

const API_KEY = process.env.ALPHAGENOME_API_KEY || 'AIzaSyC30Y-ggxeG_8gB5hUT8xJHI-OdBCFa9ng';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// AlphaGenome output types based on the official documentation
export enum OutputType {
  DNASE = 'DNASE',
  RNA_SEQ = 'RNA_SEQ',
  CAGE = 'CAGE',
  ATAC = 'ATAC',
  CHIP_HISTONE = 'CHIP_HISTONE',
  CHIP_TF = 'CHIP_TF',
  PROCAP = 'PROCAP',
  POLYADENYLATION = 'POLYADENYLATION',
  SPLICE_SITES = 'SPLICE_SITES',
  SPLICE_JUNCTIONS = 'SPLICE_JUNCTIONS'
}

export enum Organism {
  HOMO_SAPIENS = 'human',
  MUS_MUSCULUS = 'mouse'
}

export interface GenomeInterval {
  chromosome: string;
  start: number;
  end: number;
}

export interface Variant {
  chromosome: string;
  position: number;
  reference_bases: string;
  alternate_bases: string;
  name?: string;
}

export interface GenomeAnalysisRequest {
  sequence?: string;
  interval?: GenomeInterval;
  variant?: Variant;
  analysisType?: string;
  outputTypes?: OutputType[];
  ontologyTerms?: string[];
  organism?: Organism;
}

export interface GenomeAnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
  predictions?: any[];
  annotations?: any[];
}

export class AlphaGenomeAPI {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY;
    this.baseURL = BASE_URL;
  }

  private async callGemini(prompt: string): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  }

  async predictSequence(request: GenomeAnalysisRequest): Promise<GenomeAnalysisResponse> {
    try {
      const outputTypesStr = request.outputTypes?.join(', ') || 'DNase, RNA-seq, CAGE';
      const ontologyStr = request.ontologyTerms?.join(', ') || 'various tissues';
      
      const prompt = `You are an AlphaGenome AI model expert. Analyze this genomic sequence for ${outputTypesStr} predictions.

Sequence: ${request.sequence}
Organism: ${request.organism || 'human'}
Output types: ${outputTypesStr}
Tissues/Cell types: ${ontologyStr}

Provide detailed predictions including:
1. **Sequence Context**: Length, GC content, composition
2. **DNase Predictions**: DNA accessibility regions and scores
3. **RNA-seq Predictions**: Gene expression levels, transcription activity
4. **CAGE/ProCap**: Transcription start sites (TSS) identification
5. **ATAC-seq**: Open chromatin regions
6. **ChIP-seq**: Histone modifications and transcription factor binding
7. **Splicing**: Splice donor/acceptor sites (GT-AG rule)
8. **Tissue-specific Effects**: Differences across cell types

Format the output with clear sections and scientific detail.`;

      const data = await this.callGemini(prompt);
      
      return {
        success: true,
        data,
        predictions: data.candidates || [],
      };
    } catch (error: any) {
      console.error('AlphaGenome API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Analysis failed',
      };
    }
  }

  async predictInterval(request: GenomeAnalysisRequest): Promise<GenomeAnalysisResponse> {
    try {
      const interval = request.interval;
      const outputTypesStr = request.outputTypes?.join(', ') || 'RNA-seq';
      
      const prompt = `You are an AlphaGenome genomic interval analysis expert.

Analyze genomic interval:
- Chromosome: ${interval?.chromosome}
- Region: ${interval?.start} - ${interval?.end}
- Length: ${(interval?.end || 0) - (interval?.start || 0)} bp
- Organism: ${request.organism || 'human (hg38)'}
- Output types: ${outputTypesStr}
- Tissues: ${request.ontologyTerms?.join(', ') || 'multiple'}

Provide comprehensive analysis:
1. **Genomic Context**: What genes/features are in this region
2. **Track Predictions**: Predicted values for ${outputTypesStr}
3. **Gene Annotations**: Exons, introns, regulatory elements
4. **Tissue Specificity**: Expression patterns across tissues
5. **Functional Elements**: Promoters, enhancers, binding sites
6. **Conservation**: Evolutionary conservation if applicable

Use actual genomic databases knowledge (GENCODE, ENCODE) to inform predictions.`;

      const data = await this.callGemini(prompt);
      
      return {
        success: true,
        data,
        predictions: data.candidates || [],
      };
    } catch (error: any) {
      console.error('Interval Prediction Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Interval prediction failed',
      };
    }
  }

  async predictVariant(request: GenomeAnalysisRequest): Promise<GenomeAnalysisResponse> {
    try {
      const variant = request.variant;
      
      const prompt = `You are an AlphaGenome variant effect prediction expert.

Analyze genetic variant:
- Position: ${variant?.chromosome}:${variant?.position}
- Reference allele (REF): ${variant?.reference_bases}
- Alternate allele (ALT): ${variant?.alternate_bases}
- Variant ID: ${variant?.name || 'unnamed'}
- Organism: ${request.organism || 'human'}

Predict variant effects:
1. **REF vs ALT Predictions**: Compare reference and alternate allele effects
2. **Gene Impact**: Which genes are affected and how
3. **Expression Changes**: Predicted change in RNA-seq signal
4. **Splicing Effects**: Does it affect splice sites or create new ones?
5. **Regulatory Impact**: Effects on DNase, ATAC, ChIP signals
6. **Tissue Specificity**: Which tissues show strongest effects
7. **Functional Consequence**: Missense, nonsense, regulatory, splicing
8. **Clinical Relevance**: Potential pathogenicity or phenotypic effects
9. **Quantitative Scores**: Delta predictions (ALT - REF)

Provide specific numeric predictions where possible and explain the molecular mechanisms.`;

      const data = await this.callGemini(prompt);
      
      return {
        success: true,
        data,
        predictions: data.candidates || [],
      };
    } catch (error: any) {
      console.error('Variant Prediction Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Variant prediction failed',
      };
    }
  }

  async scoreVariant(request: GenomeAnalysisRequest): Promise<GenomeAnalysisResponse> {
    try {
      const variant = request.variant;
      
      const prompt = `You are an AlphaGenome variant scoring expert using multiple scoring strategies.

Score genetic variant:
- Variant: ${variant?.chromosome}:${variant?.position} ${variant?.reference_bases}>${variant?.alternate_bases}
- Organism: ${request.organism || 'human'}

Apply these AlphaGenome scoring strategies:
1. **RNA-seq Gene Scorer**: Impact on gene expression
2. **CAGE TSS Scorer**: Effect on transcription start sites
3. **Splice Site Scorer**: Impact on GT-AG splice signals
4. **DNase Center Mask Scorer**: Accessibility changes in 500bp window
5. **ATAC Center Mask Scorer**: Open chromatin effects
6. **ChIP-seq TF Scorer**: Transcription factor binding changes

For each scorer provide:
- Raw score (quantitative effect size)
- Quantile score (0-1 scale, relative to common variants)
- Affected genes/regions
- Tissue-specific scores (provide top 5 tissues)
- Interpretation (benign, uncertain, likely pathogenic)

Format as structured scoring report with clear sections.`;

      const data = await this.callGemini(prompt);
      
      return {
        success: true,
        data,
        predictions: data.candidates || [],
      };
    } catch (error: any) {
      console.error('Variant Scoring Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'Variant scoring failed',
      };
    }
  }

  async ismAnalysis(request: GenomeAnalysisRequest): Promise<GenomeAnalysisResponse> {
    try {
      const prompt = `You are an AlphaGenome In Silico Mutagenesis (ISM) expert.

Perform ISM analysis on sequence: ${request.sequence}
Organism: ${request.organism || 'human'}

ISM Analysis Process:
1. Systematically mutate each position to all other bases (3 mutations per position)
2. Score each mutation's effect on ${request.outputTypes?.join(', ') || 'DNase'}
3. Identify critical positions with largest effect sizes
4. Discover sequence motifs important for function

Provide:
1. **Position-wise Importance**: Which positions are most critical (top 20)
2. **Motif Discovery**: Identified sequence motifs (e.g., TATA box, E-box)
3. **Contribution Scores**: Per-base contribution to predictions
4. **Transcription Factor Binding**: Likely TF binding sites disrupted
5. **Functional Elements**: Promoters, enhancers, silencers identified
6. **Sequence Logo Interpretation**: Conserved vs variable positions

Present as a systematic mutagenesis report with clear insights.`;

      const data = await this.callGemini(prompt);
      
      return {
        success: true,
        data,
        predictions: data.candidates || [],
      };
    } catch (error: any) {
      console.error('ISM Analysis Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message || 'ISM analysis failed',
      };
    }
  }

  // Legacy methods maintained for backward compatibility
  async analyzeGenome(request: GenomeAnalysisRequest): Promise<GenomeAnalysisResponse> {
    return this.predictSequence(request);
  }

  async generateProteinStructure(sequence: string): Promise<GenomeAnalysisResponse> {
    return this.predictSequence({ sequence, analysisType: 'structure' });
  }

  async annotateSequence(sequence: string): Promise<GenomeAnalysisResponse> {
    return this.predictSequence({ sequence, analysisType: 'annotation' });
  }

  async analyzePromoter(sequence: string): Promise<GenomeAnalysisResponse> {
    return this.predictSequence({ sequence, analysisType: 'promoter' });
  }

  async detectSpliceSites(sequence: string): Promise<GenomeAnalysisResponse> {
    return this.predictSequence({ 
      sequence, 
      analysisType: 'splice',
      outputTypes: [OutputType.SPLICE_SITES] 
    });
  }

  async analyzeVariation(sequence: string): Promise<GenomeAnalysisResponse> {
    return this.predictSequence({ sequence, analysisType: 'variation' });
  }
}

export const alphaGenomeClient = new AlphaGenomeAPI();