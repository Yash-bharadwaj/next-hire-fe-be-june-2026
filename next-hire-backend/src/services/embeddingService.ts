import { QueryTypes } from "sequelize";
import { sequelize, Candidate, Job } from "../models";
import { logger } from "../utils/logger";

export type EmbeddingTable = "candidates" | "jobs";

export interface MatchResult {
  id: string;
  score: number;
}

export interface MatchResults {
  matches: MatchResult[];
  skippedCount: number;
}

interface EmbeddableInstance {
  id: string;
  embedding?: number[] | null;
  save: () => Promise<any>;
}

/**
 * Standard cosine similarity between two equal-length vectors.
 * Returns 0 for empty/mismatched/zero-magnitude vectors instead of NaN.
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (!a.length || a.length !== b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

/**
 * Save a vector embedding on a Candidate/Job instance.
 * Always writes the portable JSON `embedding` column; on Postgres also
 * syncs the shadow `embedding_vector` pgvector column used for fast
 * similarity search via the HNSW index.
 */
export async function persistEmbedding(
  instance: EmbeddableInstance,
  table: EmbeddingTable,
  vector: number[] | null
): Promise<void> {
  instance.embedding = vector;
  await instance.save();

  if (vector && sequelize.getDialect() === "postgres") {
    try {
      await sequelize.query(
        `UPDATE ${table} SET embedding_vector = :vector::vector WHERE id = :id`,
        { replacements: { vector: `[${vector.join(",")}]`, id: instance.id } }
      );
    } catch (error) {
      logger.error(`Failed to sync ${table}.embedding_vector for ${instance.id}`, error);
    }
  }
}

/**
 * Find the IDs of the top-N rows in `table` closest to `queryVector`.
 * Postgres: pgvector cosine distance (<=>) via the HNSW index.
 * SQLite (or if pgvector is unavailable): in-memory cosine similarity.
 */
export async function findTopMatches(
  table: EmbeddingTable,
  queryVector: number[],
  limit: number
): Promise<MatchResults> {
  if (sequelize.getDialect() === "postgres") {
    try {
      return await findTopMatchesPostgres(table, queryVector, limit);
    } catch (error) {
      logger.error(`pgvector search failed for ${table}; falling back to in-memory search`, error);
    }
  }

  return findTopMatchesInMemory(table, queryVector, limit);
}

async function findTopMatchesPostgres(
  table: EmbeddingTable,
  queryVector: number[],
  limit: number
): Promise<MatchResults> {
  const vectorLiteral = `[${queryVector.join(",")}]`;

  const [rows, skippedRows] = await Promise.all([
    sequelize.query<{ id: string; score: string }>(
      `SELECT id, 1 - (embedding_vector <=> :vector::vector) AS score
       FROM ${table}
       WHERE embedding_vector IS NOT NULL
       ORDER BY embedding_vector <=> :vector::vector
       LIMIT :limit`,
      { replacements: { vector: vectorLiteral, limit }, type: QueryTypes.SELECT }
    ),
    sequelize.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM ${table} WHERE embedding_vector IS NULL`,
      { type: QueryTypes.SELECT }
    ),
  ]);

  return {
    matches: rows.map((r) => ({ id: r.id, score: Number(r.score) })),
    skippedCount: Number(skippedRows[0]?.count || 0),
  };
}

async function findTopMatchesInMemory(
  table: EmbeddingTable,
  queryVector: number[],
  limit: number
): Promise<MatchResults> {
  const rows: Array<{ id: string; get: (key: string) => unknown }> =
    table === "candidates"
      ? await Candidate.findAll({ attributes: ["id", "embedding"] })
      : await Job.findAll({ attributes: ["id", "embedding"] });

  const scored: MatchResult[] = [];
  let skippedCount = 0;

  for (const row of rows) {
    const embedding = (row.get("embedding") as number[] | null) ?? null;
    if (!embedding || embedding.length !== queryVector.length) {
      skippedCount++;
      continue;
    }
    scored.push({ id: row.id, score: cosineSimilarity(queryVector, embedding) });
  }

  scored.sort((a, b) => b.score - a.score);

  return { matches: scored.slice(0, limit), skippedCount };
}
