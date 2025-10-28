'use client'

interface SequenceVisualizerProps {
  sequence: string;
}

export default function SequenceVisualizer({ sequence }: SequenceVisualizerProps) {
  const getBaseColor = (base: string) => {
    switch (base.toUpperCase()) {
      case 'A':
        return 'text-green-400 bg-green-500/20';
      case 'T':
      case 'U':
        return 'text-red-400 bg-red-500/20';
      case 'G':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'C':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatSequence = (seq: string) => {
    const chunks = [];
    for (let i = 0; i < seq.length; i += 10) {
      chunks.push(seq.slice(i, i + 10));
    }
    return chunks;
  };

  const chunks = formatSequence(sequence);

  return (
    <div className="font-mono text-sm">
      <div className="space-y-2">
        {chunks.map((chunk, chunkIdx) => (
          <div key={chunkIdx} className="flex items-center gap-2">
            <span className="text-gray-500 w-12 text-right">
              {chunkIdx * 10 + 1}
            </span>
            <div className="flex gap-1">
              {chunk.split('').map((base, baseIdx) => (
                <span
                  key={baseIdx}
                  className={`px-2 py-1 rounded ${getBaseColor(base)} font-bold`}
                >
                  {base}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}