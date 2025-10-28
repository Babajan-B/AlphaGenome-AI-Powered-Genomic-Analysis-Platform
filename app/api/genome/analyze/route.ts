import { NextRequest, NextResponse } from 'next/server';
import { AlphaGenomeAPI, OutputType, Organism } from '@/lib/alphagenome';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sequence, 
      analysisType, 
      interval, 
      variant,
      outputTypes,
      ontologyTerms,
      organism,
      apiKey // Extract API key from request
    } = body;

    // Create client with user's API key if provided
    const client = apiKey ? new AlphaGenomeAPI(apiKey) : new AlphaGenomeAPI();

    let result;
    
    // Parse output types if provided
    const parsedOutputTypes = outputTypes?.map((type: string) => 
      OutputType[type as keyof typeof OutputType]
    );

    // Parse organism
    const parsedOrganism = organism === 'mouse' ? Organism.MUS_MUSCULUS : Organism.HOMO_SAPIENS;

    // Handle different analysis modes
    if (variant) {
      // Variant prediction/scoring
      if (analysisType === 'score_variant') {
        result = await client.scoreVariant({
          variant,
          interval,
          organism: parsedOrganism,
          outputTypes: parsedOutputTypes
        });
      } else {
        result = await client.predictVariant({
          variant,
          interval,
          organism: parsedOrganism,
          outputTypes: parsedOutputTypes,
          ontologyTerms
        });
      }
    } else if (interval) {
      // Interval-based prediction
      result = await client.predictInterval({
        interval,
        organism: parsedOrganism,
        outputTypes: parsedOutputTypes,
        ontologyTerms
      });
    } else if (analysisType === 'ism') {
      // In Silico Mutagenesis
      result = await client.ismAnalysis({
        sequence,
        organism: parsedOrganism,
        outputTypes: parsedOutputTypes
      });
    } else if (sequence) {
      // Sequence-based analysis
      switch (analysisType) {
        case 'structure':
          result = await client.generateProteinStructure(sequence);
          break;
        case 'annotation':
          result = await client.annotateSequence(sequence);
          break;
        case 'promoter':
          result = await client.analyzePromoter(sequence);
          break;
        case 'splice':
          result = await client.detectSpliceSites(sequence);
          break;
        case 'variation':
          result = await client.analyzeVariation(sequence);
          break;
        default:
          result = await client.predictSequence({
            sequence,
            analysisType,
            organism: parsedOrganism,
            outputTypes: parsedOutputTypes,
            ontologyTerms
          });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Sequence, interval, or variant is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}