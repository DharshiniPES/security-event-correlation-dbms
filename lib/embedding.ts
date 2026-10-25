/**
 * Deterministic Semantic Embedding Engine (384 Dimensions)
 * 
 * Implements Feature Hashing + Subword N-Gram tokenization with Cosine L2-Normalization.
 * Compatible with pgvector's vector(384) column type and HNSW cosine distance (<=>).
 * Generates reproducible dense vector embeddings completely offline without external API dependencies.
 */

const DIMENSIONS = 384;

// Simple string hash utility (32-bit FNV-1a variant)
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function generateEmbedding(text: string): number[] {
  const vector = new Array(DIMENSIONS).fill(0);
  if (!text || text.trim().length === 0) {
    return vector;
  }

  // Normalize text: lowercase, remove non-alphanumeric except hyphens and dots
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\-_\s]/g, ' ');
  const tokens = cleanText.split(/\s+/).filter(t => t.length > 1);

  // 1. Process Word Tokens and Subword Character N-Grams
  tokens.forEach((token, idx) => {
    // Word level feature
    const wordHash = hashString(token);
    const bucket = wordHash % DIMENSIONS;
    const sign = (wordHash & 1) === 0 ? 1 : -1;
    vector[bucket] += sign * (1.0 + 1.0 / (idx + 1));

    // Subword tri-grams for typo resilience and partial matching
    if (token.length >= 3) {
      for (let i = 0; i <= token.length - 3; i++) {
        const tri = token.substring(i, i + 3);
        const triHash = hashString(tri);
        const triBucket = triHash % DIMENSIONS;
        const triSign = (triHash & 1) === 0 ? 1 : -1;
        vector[triBucket] += triSign * 0.45;
      }
    }
  });

  // 2. Compute Euclidean (L2) Norm
  let sumSquares = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    sumSquares += vector[i] * vector[i];
  }

  const magnitude = Math.sqrt(sumSquares);
  if (magnitude === 0) {
    return vector;
  }

  // 3. Normalize vector to unit length (so that Cosine Distance = 1 - Dot Product)
  for (let i = 0; i < DIMENSIONS; i++) {
    vector[i] = Number((vector[i] / magnitude).toFixed(6));
  }

  return vector;
}

/**
 * Formats a JavaScript number array into a pgvector string representation:
 * '[0.0123, -0.0456, 0.7891, ...]'
 */
export function formatVectorForPg(vector: number[]): string {
  return `[${vector.join(',')}]`;
}
