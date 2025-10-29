from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

# Import AlphaGenome SDK
try:
    from alphagenome.data import genome
    from alphagenome.models import dna_client, variant_scorers
except ImportError:
    print("WARNING: AlphaGenome package not installed. Run: pip install alphagenome")
    genome = None
    dna_client = None
    variant_scorers = None

app = FastAPI(title="AlphaGenome API Server")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VariantInput(BaseModel):
    chromosome: str
    position: int
    reference_bases: str
    alternate_bases: str

class IntervalInput(BaseModel):
    chromosome: str
    start: int
    end: int

class AnalysisRequest(BaseModel):
    api_key: str
    analysis_type: str
    organism: str = "human"
    sequence: Optional[str] = None
    variant: Optional[VariantInput] = None
    interval: Optional[IntervalInput] = None
    output_types: List[str] = ["RNA_SEQ"]
    ontology_terms: List[str] = ["UBERON:0002048"]
    use_scoring: bool = False  # Use variant scoring instead of just predictions

def get_nearest_supported_length(length: int) -> int:
    """Get the nearest supported AlphaGenome sequence length"""
    supported_lengths = [2048, 16384, 131072, 524288, 1048576]
    
    # Find the closest supported length
    closest = min(supported_lengths, key=lambda x: abs(x - length))
    
    # If the requested length is larger, use the largest supported
    if length > max(supported_lengths):
        return max(supported_lengths)
    
    # If the requested length is between two supported lengths, use the larger one
    for i, sup_len in enumerate(supported_lengths):
        if length <= sup_len:
            return sup_len
    
    return closest

@app.get("/")
def read_root():
    return {
        "message": "AlphaGenome API Server",
        "status": "running",
        "alphagenome_available": dna_client is not None
    }

@app.post("/api/analyze")
async def analyze_variant(request: AnalysisRequest):
    """
    Analyze genomic data using the real AlphaGenome API
    """
    if dna_client is None:
        raise HTTPException(
            status_code=500,
            detail="AlphaGenome package not installed. Please run: pip install alphagenome"
        )
    
    try:
        # Create AlphaGenome client with API key
        model = dna_client.create(request.api_key)
        
        # Map output types
        output_types = []
        for ot in request.output_types:
            if hasattr(dna_client.OutputType, ot):
                output_types.append(getattr(dna_client.OutputType, ot))
        
        # Map organism
        organism = (
            dna_client.Organism.MUS_MUSCULUS 
            if request.organism == "mouse" 
            else dna_client.Organism.HOMO_SAPIENS
        )
        
        result = None
        
        # Handle variant analysis
        if request.variant and request.interval:
            variant = genome.Variant(
                chromosome=request.variant.chromosome,
                position=request.variant.position,
                reference_bases=request.variant.reference_bases,
                alternate_bases=request.variant.alternate_bases,
            )
            
            # Create interval and auto-resize to supported length
            interval = genome.Interval(
                chromosome=request.interval.chromosome,
                start=request.interval.start,
                end=request.interval.end,
            )
            
            # Calculate current length and resize if needed
            current_length = interval.end - interval.start
            target_length = get_nearest_supported_length(current_length)
            
            if current_length != target_length:
                print(f"Resizing interval from {current_length} to {target_length} bp")
                interval = interval.resize(target_length)
            
            if request.analysis_type == "score_variant" or request.use_scoring:
                # Use COMPLETE variant scoring with all recommended scorers
                print("Using variant scoring with all recommended scorers...")
                
                all_variant_scores = model.score_variant(
                    interval=interval,
                    variant=variant,
                    variant_scorers=list(variant_scorers.RECOMMENDED_VARIANT_SCORERS.values()),
                    organism=organism,
                )
                
                # Convert to tidy format
                df_scores = variant_scorers.tidy_scores(all_variant_scores)
                
                result = {
                    "variant": f"{variant.chromosome}:{variant.position}:{variant.reference_bases}>{variant.alternate_bases}",
                    "interval": f"{interval.chromosome}:{interval.start}-{interval.end}",
                    "interval_length": interval.end - interval.start,
                    "scoring_results": df_scores.to_dict('records'),
                    "output_types": ["SCORING"],
                    "score_summary": {
                        "total_genes": len(df_scores['gene_symbol'].unique()) if 'gene_symbol' in df_scores.columns else 0,
                        "total_tracks": len(df_scores),
                        "scorers_used": df_scores['variant_scorer'].unique().tolist() if 'variant_scorer' in df_scores.columns else [],
                    }
                }
            else:
                # Predict variant effect for ALL requested output types
                print(f"Predicting variant effects for output types: {request.output_types}")
                
                outputs = model.predict_variant(
                    interval=interval,
                    variant=variant,
                    organism=organism,
                    requested_outputs=output_types,
                    ontology_terms=request.ontology_terms,
                )
                
                # Convert output to serializable format - DYNAMICALLY for all output types
                result = {
                    "reference": {},
                    "alternate": {},
                    "variant": f"{variant.chromosome}:{variant.position}:{variant.reference_bases}>{variant.alternate_bases}",
                    "interval": f"{interval.chromosome}:{interval.start}-{interval.end}",
                    "interval_length": interval.end - interval.start,
                    "output_types": request.output_types
                }
                
                # Map of output type names to their attribute names
                output_type_map = {
                    'RNA_SEQ': 'rna_seq',
                    'DNASE': 'dnase',
                    'ATAC': 'atac',
                    'CAGE': 'cage',
                    'CHIP_HISTONE': 'chip_histone',
                    'CHIP_TF': 'chip_tf',
                    'PROCAP': 'procap',
                    'SPLICE_SITES': 'splice_sites',
                    'SPLICE_SITE_USAGE': 'splice_site_usage',
                    'SPLICE_JUNCTIONS': 'splice_junctions',
                    'CONTACT_MAPS': 'contact_maps',
                }
                
                # Extract data for each requested output type
                for output_type in request.output_types:
                    output_attr = output_type_map.get(output_type, output_type.lower())
                    
                    if hasattr(outputs.reference, output_attr) and hasattr(outputs.alternate, output_attr):
                        ref_track = getattr(outputs.reference, output_attr)
                        alt_track = getattr(outputs.alternate, output_attr)
                        
                        if ref_track is not None and alt_track is not None:
                            result["reference"][output_attr] = {
                                "shape": list(ref_track.values.shape),
                                "metadata": ref_track.metadata.to_dict('records'),
                                "values_sample": ref_track.values[:100, :].tolist() if hasattr(ref_track.values, 'tolist') else [],
                            }
                            
                            result["alternate"][output_attr] = {
                                "shape": list(alt_track.values.shape),
                                "metadata": alt_track.metadata.to_dict('records'),
                                "values_sample": alt_track.values[:100, :].tolist() if hasattr(alt_track.values, 'tolist') else [],
                            }
                            
                            print(f"✓ Extracted {output_type} data: {ref_track.values.shape}")
                        else:
                            print(f"✗ No data for {output_type}")
                    else:
                        print(f"✗ Output type {output_type} not available in predictions")
        
        # Handle interval analysis
        elif request.interval:
            interval = genome.Interval(
                chromosome=request.interval.chromosome,
                start=request.interval.start,
                end=request.interval.end,
            )
            
            # Auto-resize to supported length
            current_length = interval.end - interval.start
            target_length = get_nearest_supported_length(current_length)
            
            if current_length != target_length:
                print(f"Resizing interval from {current_length} to {target_length} bp")
                interval = interval.resize(target_length)
            
            outputs = model.predict_interval(
                interval=interval,
                organism=organism,
                requested_outputs=output_types,
                ontology_terms=request.ontology_terms,
            )
            
            result = {
                "interval": f"{interval.chromosome}:{interval.start}-{interval.end}",
                "interval_length": interval.end - interval.start,
                "output_types": request.output_types,
            }
            
            # Extract all output types
            for output_type in request.output_types:
                output_attr = output_type.lower()
                if hasattr(outputs, output_attr):
                    track_data = getattr(outputs, output_attr)
                    if track_data is not None:
                        result[output_attr] = {
                            "shape": list(track_data.values.shape),
                            "metadata": track_data.metadata.to_dict('records'),
                        }
        
        # Handle sequence analysis
        elif request.sequence:
            # Auto-resize sequence to supported length
            current_length = len(request.sequence)
            target_length = get_nearest_supported_length(current_length)
            
            if current_length != target_length:
                # Pad or truncate sequence
                if current_length < target_length:
                    request.sequence = request.sequence.center(target_length, 'N')
                else:
                    request.sequence = request.sequence[:target_length]
            
            outputs = model.predict_sequence(
                sequence=request.sequence,
                organism=organism,
                requested_outputs=output_types,
                ontology_terms=request.ontology_terms,
            )
            
            result = {
                "sequence_length": len(request.sequence),
                "output_types": request.output_types,
            }
            
            # Extract all output types
            for output_type in request.output_types:
                output_attr = output_type.lower()
                if hasattr(outputs, output_attr):
                    track_data = getattr(outputs, output_attr)
                    if track_data is not None:
                        result[output_attr] = {
                            "shape": list(track_data.values.shape),
                            "metadata": track_data.metadata.to_dict('records'),
                        }
        
        return {
            "success": True,
            "data": result,
            "message": "Analysis completed using real AlphaGenome API"
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"AlphaGenome API error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    print("Starting AlphaGenome API Server on http://localhost:8000")
    print("Frontend should connect to: http://localhost:8000/api/analyze")
    print("Supported output types: RNA_SEQ, DNASE, ATAC, CAGE, CHIP_HISTONE, CHIP_TF, PROCAP, SPLICE_SITES, etc.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
