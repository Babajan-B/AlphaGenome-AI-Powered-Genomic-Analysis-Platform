import { NextRequest, NextResponse } from 'next/server';

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
      apiKey
    } = body;

    // Call Python backend with real AlphaGenome API
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    
    console.log('Calling Python backend at:', pythonBackendUrl);
    console.log('Request data:', { analysisType, variant, interval, outputTypes });

    const response = await fetch(`${pythonBackendUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        analysis_type: analysisType,
        organism: organism || 'human',
        sequence,
        variant,
        interval,
        output_types: outputTypes || ['RNA_SEQ'],
        ontology_terms: ontologyTerms || ['UBERON:0002048'],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Python backend error:', data);
      return NextResponse.json(
        { success: false, error: data.detail || 'Analysis failed' },
        { status: response.status }
      );
    }

    console.log('Python backend response:', data);

    // Format response to match frontend expectations
    return NextResponse.json({
      success: true,
      data: data.data,
      predictions: [{
        content: {
          parts: [{
            text: `Real AlphaGenome Analysis Results:

Variant: ${data.data.variant || 'N/A'}
Interval: ${data.data.interval || 'N/A'}

${JSON.stringify(data.data, null, 2)}

${data.message}`
          }]
        }
      }],
      message: data.message
    });

  } catch (error: any) {
    console.error('API Error:', error);
    
    // If Python backend is not running
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Python backend not running on port 8000. Please start it with: cd python-backend && python main.py' 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}