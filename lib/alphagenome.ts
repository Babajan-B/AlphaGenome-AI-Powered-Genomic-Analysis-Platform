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
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // Start with 2 seconds

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY;
    this.baseURL = BASE_URL;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async callGemini(prompt: string, retryCount: number = 0): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000 // 60 second timeout
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      const statusCode = error.response?.status;

      // Check if it's a rate limit or overload error
      if (statusCode === 429 || errorMessage.includes('overloaded') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`API overloaded. Retrying in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/${this.maxRetries})`);
          await this.sleep(delay);
          return this.callGemini(prompt, retryCount + 1);
        } else {
          throw new Error('Google Gemini AI is currently experiencing high traffic. Please try again in a few minutes. You can also try using a different API key or waiting for the service to stabilize.');
        }
      }

      // Check for invalid API key
      if (statusCode === 400 && errorMessage.includes('API key')) {
        throw new Error('Invalid API Key. Please check your API key in Settings and make sure it\'s correct.');
      }

      // Check for blocked content
      if (errorMessage.includes('blocked') || errorMessage.includes('safety')) {
        throw new Error('Content was blocked by safety filters. Try a different sequence or analysis type.');
      }

      // Generic error
      throw new Error(`API Error: ${errorMessage}. Status: ${statusCode || 'Unknown'}`);
    }
  }

  async predictSequence(request: GenomeAnalysisRequest): Promise<GenomeAnalysisResponse> {
    try {
      const outputTypesStr = request.outputTypes?.join(', ') || 'DNase, RNA-seq, CAGE';
      const ontologyStr = request.ontologyTerms?.join(', ') || 'various tissues';
      const seqLength = request.sequence?.length || 0;
      
      const prompt = `You are an AlphaGenome AI model expert. Analyze this SPECIFIC genomic sequence (not an example).

**ACTUAL SEQUENCE TO ANALYZE:**
Sequence: ${request.sequence}
Length: ${seqLength} bp
Organism: ${request.organism || 'human (hg38)'}
Output types requested: ${outputTypesStr}
Tissues/Cell types: ${ontologyStr}

**CRITICAL**: Analyze THIS exact ${seqLength} bp sequence provided above, not any example sequences.

Provide detailed predictions including:

1. **Sequence Composition Analysis**
   - Actual sequence: ${request.sequence}
   - Length: ${seqLength} base pairs
   - GC content: [calculate from actual sequence]
   - Nucleotide composition: A, T, G, C counts
   - Repetitive elements or simple repeats
   - CpG islands if present

2. **DNase-seq Predictions (DNA Accessibility)**
   - Predict DNase hypersensitive sites in THIS sequence
   - Accessibility scores per region (0-1 scale)
   - Most accessible positions (mark specific positions)
   - Footprinting patterns suggesting protein binding

3. **RNA-seq Predictions (Gene Expression)**
   - Transcription potential of THIS sequence
   - Expression levels across tissues: ${ontologyStr}
   - Coding potential score
   - Strand specificity if applicable

4. **CAGE/ProCap (Transcription Start Sites)**
   - Identify potential TSS in positions 1-${seqLength}
   - TATA box or initiator elements (positions)
   - Promoter activity score
   - 5' UTR regions

5. **ATAC-seq (Open Chromatin)**
   - Open chromatin regions in THIS sequence
   - Nucleosome positioning predictions
   - Transposase accessibility scores

6. **ChIP-seq Predictions**
   - Histone modifications (H3K4me3, H3K27ac, etc.)
   - Transcription factor binding motifs found
   - Specific TF names and binding positions
   - Enhancer or silencer activity

7. **Splice Site Detection**
   - Scan for GT-AG splice sites in positions 1-${seqLength}
   - Donor sites (GT): list exact positions
   - Acceptor sites (AG): list exact positions
   - Branch point sequences
   - Splice strength scores

8. **Tissue-Specific Effects**
   - Activity in: ${ontologyStr}
   - Which tissues show highest signals
   - Cell-type specific regulatory elements

Provide SPECIFIC predictions for THIS ${seqLength} bp sequence: ${request.sequence}. Include position numbers and numerical scores.`;

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
      const intervalLength = (interval?.end || 0) - (interval?.start || 0);
      const outputTypesStr = request.outputTypes?.join(', ') || 'RNA-seq';
      const tissuesStr = request.ontologyTerms?.join(', ') || 'multiple tissues';
      
      const prompt = `You are an AlphaGenome genomic interval analysis expert. Analyze this SPECIFIC genomic region.

**EXACT GENOMIC INTERVAL TO ANALYZE:**
- Chromosome: ${interval?.chromosome}
- Start position: ${interval?.start}
- End position: ${interval?.end}
- Length: ${intervalLength} bp (${(intervalLength / 1000).toFixed(1)} kb)
- Full coordinate: ${interval?.chromosome}:${interval?.start}-${interval?.end}
- Organism: ${request.organism || 'human (hg38)'}
- Output types: ${outputTypesStr}
- Tissues: ${tissuesStr}

**IMPORTANT**: Analyze THIS specific region (${interval?.chromosome}:${interval?.start}-${interval?.end}), not any example coordinates.

Provide comprehensive analysis:

1. **Genomic Context for ${interval?.chromosome}:${interval?.start}-${interval?.end}**
   - Known genes in this EXACT region (use genome annotation knowledge)
   - Gene names, orientations (+ or - strand)
   - Exon/intron structure if coding
   - Regulatory elements (promoters, enhancers)
   - UTRs, non-coding RNAs

2. **Track Predictions for ${outputTypesStr}**
   - Generate prediction tracks for this ${intervalLength} bp window
   - RNA-seq: Expression levels (RPKM/FPKM values)
   - DNase-seq: Accessibility peaks (positions relative to ${interval?.start})
   - CAGE: TSS positions within ${interval?.start}-${interval?.end}
   - ATAC-seq: Open chromatin regions
   - ChIP-seq: Histone marks and TF binding

3. **Gene Annotations in ${interval?.chromosome}:${interval?.start}-${interval?.end}**
   - List specific genes overlapping this region
   - Transcript variants in this interval
   - Coding vs non-coding classification
   - Gene ontology functions

4. **Tissue Specificity Analysis (${tissuesStr})**
   - Expression patterns across: ${tissuesStr}
   - Which tissues show highest activity in this region
   - Tissue-specific enhancers
   - Differential expression predictions

5. **Functional Elements**
   - Promoters: positions within ${interval?.start}-${interval?.end}
   - Enhancers: positions and target genes
   - Insulators/CTCF binding sites
   - CpG islands: positions
   - Conserved non-coding elements

6. **Quantitative Predictions**
   - Numerical scores for each track type
   - Peak heights and positions
   - Confidence intervals
   - Compare to genome-wide baseline

7. **Clinical/Biological Relevance**
   - Disease associations for genes in ${interval?.chromosome}:${interval?.start}-${interval?.end}
   - Known variants in this region
   - Pathway involvement
   - Druggable targets if applicable

Use actual genomic databases knowledge (GENCODE, ENCODE, RefSeq) to inform predictions for THIS specific ${intervalLength} bp region.`;

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
      const interval = request.interval;
      const outputTypesStr = request.outputTypes?.join(', ') || 'RNA-seq, DNase, ATAC';
      const tissuesStr = request.ontologyTerms?.join(', ') || 'multiple tissues';
      
      const prompt = `You are an AlphaGenome variant effect prediction expert. Analyze this SPECIFIC genetic variant with precise details.

**VARIANT DETAILS (USE THESE EXACT VALUES):**
- Chromosome: ${variant?.chromosome}
- Position: ${variant?.position}
- Reference Allele (REF): ${variant?.reference_bases}
- Alternate Allele (ALT): ${variant?.alternate_bases}
- Variant Notation: ${variant?.chromosome}:${variant?.position}:${variant?.reference_bases}>${variant?.alternate_bases}
- Genomic Context: ${interval?.chromosome}:${interval?.start}-${interval?.end}
- Organism: ${request.organism || 'human (hg38)'}
- Output Types: ${outputTypesStr}
- Tissues Analyzed: ${tissuesStr}

**IMPORTANT**: Base your analysis on the SPECIFIC variant above (${variant?.chromosome}:${variant?.position} ${variant?.reference_bases}>${variant?.alternate_bases}), NOT any example variants.

Perform comprehensive variant effect prediction:

1. **Variant Summary**
   - Exact variant: ${variant?.chromosome}:${variant?.position} ${variant?.reference_bases}→${variant?.alternate_bases}
   - Type of variant (SNV, insertion, deletion)
   - Genomic location context

2. **REF vs ALT Allele Effects**
   - REF allele (${variant?.reference_bases}) predictions: baseline signals
   - ALT allele (${variant?.alternate_bases}) predictions: altered signals
   - Delta scores (ALT - REF) for each output type
   - Direction of change (increase/decrease)

3. **Gene Impact Analysis**
   - Genes in the region ${interval?.chromosome}:${interval?.start}-${interval?.end}
   - Coding vs non-coding impact
   - Exonic, intronic, or regulatory region
   - Affected transcripts

4. **Molecular Effects for ${outputTypesStr}**
   - RNA-seq: Change in gene expression (fold change)
   - DNase-seq: Chromatin accessibility changes
   - ATAC-seq: Open chromatin alterations
   - ChIP-seq: Transcription factor binding disruption/creation
   - CAGE: Transcription start site effects

5. **Splicing Analysis**
   - Splice site creation or disruption
   - Check for GT-AG canonical sites affected
   - Cryptic splice site activation

6. **Tissue-Specific Effects (${tissuesStr})**
   - Which tissues show strongest effect
   - Tissue-specific expression changes
   - Clinical relevance by tissue

7. **Functional Consequence Classification**
   - Missense, nonsense, silent, regulatory, splicing
   - ClinVar/dbSNP annotations if known
   - Predicted pathogenicity (benign/pathogenic/VUS)

8. **Quantitative Predictions**
   - Numerical scores for each output type
   - Statistical confidence/p-values
   - Effect size magnitudes

Provide specific, quantitative predictions for THIS exact variant (${variant?.chromosome}:${variant?.position} ${variant?.reference_bases}>${variant?.alternate_bases}).`;

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
      const interval = request.interval;
      const outputTypesStr = request.outputTypes?.join(', ') || 'RNA-seq, CAGE, Splice Sites';
      
      const prompt = `You are an AlphaGenome variant scoring expert. Score this SPECIFIC variant using multiple scoring strategies.

**VARIANT TO SCORE (USE THESE EXACT VALUES):**
- Variant: ${variant?.chromosome}:${variant?.position}
- Reference: ${variant?.reference_bases}
- Alternate: ${variant?.alternate_bases}
- Full notation: ${variant?.chromosome}:${variant?.position}:${variant?.reference_bases}>${variant?.alternate_bases}
- Context region: ${interval?.chromosome}:${interval?.start}-${interval?.end}
- Organism: ${request.organism || 'human'}

**CRITICAL**: Score THIS specific variant (${variant?.chromosome}:${variant?.position} ${variant?.reference_bases}→${variant?.alternate_bases}), not any examples.

Apply AlphaGenome multi-scorer analysis for ${outputTypesStr}:

**1. RNA-seq Gene Expression Scorer**
   For variant ${variant?.chromosome}:${variant?.position}:${variant?.reference_bases}>${variant?.alternate_bases}:
   - Identify genes in ${interval?.start}-${interval?.end} region
   - REF allele gene expression score
   - ALT allele gene expression score
   - Delta score (ALT - REF)
   - Affected genes and magnitude

**2. CAGE TSS Scorer**
   - Transcription start sites near position ${variant?.position}
   - Effect on promoter activity
   - Distance to nearest TSS
   - Score change: numerical value

**3. Splice Site Scorer**
   - Check if position ${variant?.position} is at splice junction
   - Donor site (GT) or acceptor site (AG) disruption
   - Score for ${variant?.reference_bases} vs ${variant?.alternate_bases}
   - Cryptic splice site creation

**4. DNase Center Mask Scorer (500bp window)**
   - DNase accessibility at chr${variant?.chromosome}:${variant?.position}
   - Window: ${(variant?.position || 0) - 250} to ${(variant?.position || 0) + 250}
   - Accessibility score change
   - Footprinting effects

**5. ATAC Center Mask Scorer**
   - Open chromatin signal at position ${variant?.position}
   - REF vs ALT chromatin state
   - Effect magnitude (0-1 scale)

**6. ChIP-seq TF Binding Scorer**
   - Transcription factors binding near ${variant?.position}
   - Motif disruption (REF=${variant?.reference_bases}, ALT=${variant?.alternate_bases})
   - Binding affinity changes
   - Affected TF families

**SCORING OUTPUT FORMAT:**
For each scorer, provide:
├─ Raw Score: [numerical value with units]
├─ Quantile Score: [0.0 to 1.0, higher = more extreme]
├─ Effect Direction: [increase/decrease/neutral]
├─ Affected Elements: [specific genes/sites/regions]
├─ Top 5 Tissues: [tissue names with scores]
└─ Interpretation: [clinical significance]

**AGGREGATED PATHOGENICITY SCORE:**
- Combined score across all scorers
- Overall interpretation (Benign/Likely Benign/VUS/Likely Pathogenic/Pathogenic)
- Confidence level
- Most impacted biological processes

Remember: Analyze the ACTUAL variant ${variant?.chromosome}:${variant?.position}:${variant?.reference_bases}>${variant?.alternate_bases}, provide specific numeric scores.`;

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
      const seqLength = request.sequence?.length || 0;
      const outputTypesStr = request.outputTypes?.join(', ') || 'DNase';
      
      const prompt = `You are an AlphaGenome In Silico Mutagenesis (ISM) expert. Perform systematic mutagenesis on THIS specific sequence.

**ACTUAL SEQUENCE FOR ISM ANALYSIS:**
Sequence: ${request.sequence}
Length: ${seqLength} bp
Organism: ${request.organism || 'human'}
Output types: ${outputTypesStr}

**CRITICAL**: Perform ISM on THIS exact ${seqLength} bp sequence above, not any examples.

**ISM Analysis Process:**
For THIS sequence (${request.sequence}):

1. **Systematic Mutagenesis**
   - Total positions: ${seqLength}
   - Mutations per position: 3 (mutate each base to other 3 bases)
   - Total mutations to evaluate: ${seqLength * 3}
   - Baseline prediction: score for wildtype sequence

2. **Position-wise Importance (Top 20 Critical Positions)**
   For THIS ${seqLength} bp sequence:
   - List positions 1-${seqLength} by importance
   - Report position number, original base, effect magnitude
   - Format: Position X: [base] → ΔScore = [value]
   - Identify the 20 positions with largest effect when mutated

3. **Motif Discovery**
   Found in THIS sequence:
   - TATA box (TATAAA): positions if present
   - CAAT box: positions
   - GC box: positions
   - E-box (CANNTG): positions
   - Other regulatory motifs: name and position
   - Consensus sequences identified

4. **Contribution Scores**
   For each position 1-${seqLength}:
   - A: contribution score
   - T: contribution score
   - G: contribution score
   - C: contribution score
   - Which base at each position maximizes ${outputTypesStr} signal

5. **Transcription Factor Binding Sites**
   Predicted TF binding in positions 1-${seqLength}:
   - TF name (e.g., NF-κB, CREB, AP-1)
   - Binding motif sequence
   - Position in THIS sequence (start-end)
   - Binding affinity score
   - Effect of disrupting this site

6. **Functional Elements Classification**
   Within THIS ${seqLength} bp sequence:
   - Promoter elements: positions
   - Enhancer elements: positions
   - Silencer elements: positions
   - Insulator elements: positions
   - Core promoter region if applicable

7. **Sequence Logo Interpretation**
   - Most conserved positions: list top 10 positions
   - Variable positions tolerant to mutation
   - Information content per position
   - Flanking sequence requirements

8. **Mutagenesis Sensitivity Map**
   Position-by-position sensitivity:
   - High sensitivity positions (>0.5 effect): list positions
   - Medium sensitivity (0.2-0.5): list positions
   - Low sensitivity (<0.2): list positions
   - Essential vs redundant bases

**Summary:**
- Most critical 5 positions in THIS sequence for ${outputTypesStr} activity
- Key motifs that must be preserved
- Positions safe for mutation (won't affect function)
- Overall sequence architecture interpretation

Present as a systematic mutagenesis report for THIS exact ${seqLength} bp sequence with specific position numbers and scores.`;

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