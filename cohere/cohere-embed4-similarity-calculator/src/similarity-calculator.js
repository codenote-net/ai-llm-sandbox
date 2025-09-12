import { CohereEmbedding } from './cohere-embedding.js';

export class SimilarityCalculator {
  constructor(apiKey = null) {
    this.cohereEmbedding = new CohereEmbedding(apiKey);
  }

  async calculateSimilarity(imagePath, textQuery) {
    console.log(`Image-text similarity calculation: ${imagePath} vs "${textQuery}"`);

    try {
      // Get image embedding
      const imageEmbedding = await this.cohereEmbedding.getImageEmbedding(imagePath);
      
      // Get text embedding
      const textEmbedding = await this.getTextEmbedding(textQuery);
      
      // Calculate similarity
      const similarity = CohereEmbedding.cosineSimilarity(
        imageEmbedding.embedding,
        textEmbedding.embedding
      );

      return {
        imagePath,
        textQuery,
        similarity,
        imageMetadata: imageEmbedding.metadata,
        textMetadata: textEmbedding.metadata,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        imagePath,
        textQuery,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getTextEmbedding(text) {
    try {
      const response = await this.cohereEmbedding.cohere.embed({
        model: this.cohereEmbedding.model,
        texts: [text],
        inputType: 'search_query',
        embeddingTypes: ['float']
      });

      return {
        embedding: response.embeddings.float[0],
        metadata: {
          text,
          model: this.cohereEmbedding.model,
          dimensions: response.embeddings.float[0].length,
          inputType: 'search_query',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get text embedding: ${error.message}`);
    }
  }

  async calculateMultipleSimilarities(testCases) {
    console.log(`Starting similarity calculation for multiple image-text pairs (${testCases.length} cases)`);

    const results = [];
    
    for (const testCase of testCases) {
      const { imagePath, textQueries, description } = testCase;
      
      console.log(`Calculating: ${description || imagePath}`);
      
      const caseResults = {
        imagePath,
        description,
        queries: [],
        summary: {
          total: textQueries.length,
          successful: 0,
          errors: 0,
          averageSimilarity: 0,
          maxSimilarity: 0,
          minSimilarity: 1
        }
      };

      const similarities = [];

      for (const query of textQueries) {
        try {
          const result = await this.calculateSimilarity(imagePath, query);
          
          caseResults.queries.push(result);
          
          if (result.error) {
            caseResults.summary.errors++;
          } else {
            caseResults.summary.successful++;
            similarities.push(result.similarity);
          }
          
        } catch (error) {
          caseResults.queries.push({
            imagePath,
            textQuery: query,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          caseResults.summary.errors++;
        }
      }

      // Calculate statistics
      if (similarities.length > 0) {
        caseResults.summary.averageSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
        caseResults.summary.maxSimilarity = Math.max(...similarities);
        caseResults.summary.minSimilarity = Math.min(...similarities);
      }
      
      results.push(caseResults);
    }

    return this.analyzeSimilarityResults(results);
  }

  async calculateSemanticSimilarity(imagePath, concepts) {
    console.log(`Calculating semantic similarity: ${imagePath}`);

    const results = {
      imagePath,
      concepts: [],
      summary: {
        totalConcepts: concepts.length,
        highConfidence: 0,
        mediumConfidence: 0,
        lowConfidence: 0,
        averageConfidence: 0
      }
    };

    try {
      const imageEmbedding = await this.cohereEmbedding.getImageEmbedding(imagePath);
      
      for (const concept of concepts) {
        const { text, category, expectedRelevance } = concept;
        
        try {
          const textEmbedding = await this.getTextEmbedding(text);
          const similarity = CohereEmbedding.cosineSimilarity(
            imageEmbedding.embedding,
            textEmbedding.embedding
          );

          let confidenceLevel;
          if (similarity >= 0.8) confidenceLevel = 'high';
          else if (similarity >= 0.6) confidenceLevel = 'medium';
          else confidenceLevel = 'low';

          results.concepts.push({
            text,
            category,
            similarity,
            confidenceLevel
          });

          results.summary[`${confidenceLevel}Confidence`]++;
          
        } catch (error) {
          results.concepts.push({
            text,
            category,
            error: error.message
          });
        }
      }

      // Calculate average confidence
      const validConcepts = results.concepts.filter(c => !c.error);
      if (validConcepts.length > 0) {
        results.summary.averageConfidence = 
          validConcepts.reduce((sum, c) => sum + c.similarity, 0) / validConcepts.length;
      }

      return results;
      
    } catch (error) {
      return {
        imagePath,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  analyzeSimilarityResults(results) {
    const summary = {
      totalCases: results.length,
      totalQueries: 0,
      overallSuccessful: 0,
      overallErrors: 0,
      overallAverageSimilarity: 0,
      overallMaxSimilarity: 0,
      overallMinSimilarity: 1
    };

    const allSimilarities = [];

    for (const caseResult of results) {
      summary.totalQueries += caseResult.summary.total;
      summary.overallSuccessful += caseResult.summary.successful;
      summary.overallErrors += caseResult.summary.errors;

      // Aggregate similarity for each case
      const validQueries = caseResult.queries.filter(q => !q.error);
      for (const query of validQueries) {
        allSimilarities.push(query.similarity);
      }
    }

    // Calculate overall similarity statistics
    if (allSimilarities.length > 0) {
      summary.overallAverageSimilarity = allSimilarities.reduce((a, b) => a + b, 0) / allSimilarities.length;
      summary.overallMaxSimilarity = Math.max(...allSimilarities);
      summary.overallMinSimilarity = Math.min(...allSimilarities);
    }

    return {
      summary,
      results,
      timestamp: new Date().toISOString()
    };
  }

  // Calculate similarity between document content and technical terms
  async calculateDocumentContentSimilarity(imagePath, documentType, keyTerms) {
    console.log(`Calculating similarity with document content: ${imagePath} (${documentType})`);

    const results = {
      imagePath,
      documentType,
      keyTerms: [],
      summary: {
        totalTerms: keyTerms.length,
        strongMatches: 0,
        moderateMatches: 0,
        weakMatches: 0,
        averageRelevance: 0
      }
    };

    try {
      const imageEmbedding = await this.cohereEmbedding.getImageEmbedding(imagePath);

      for (const term of keyTerms) {
        const query = `${documentType} ${term}`;
        
        try {
          const textEmbedding = await this.getTextEmbedding(query);
          const similarity = CohereEmbedding.cosineSimilarity(
            imageEmbedding.embedding,
            textEmbedding.embedding
          );

          let matchStrength;
          if (similarity >= 0.8) {
            matchStrength = 'strong';
            results.summary.strongMatches++;
          } else if (similarity >= 0.6) {
            matchStrength = 'moderate';
            results.summary.moderateMatches++;
          } else {
            matchStrength = 'weak';
            results.summary.weakMatches++;
          }

          results.keyTerms.push({
            term,
            query,
            similarity,
            matchStrength
          });

        } catch (error) {
          results.keyTerms.push({
            term,
            error: error.message
          });
        }
      }

      // Calculate average relevance
      const validTerms = results.keyTerms.filter(t => !t.error);
      if (validTerms.length > 0) {
        results.summary.averageRelevance = 
          validTerms.reduce((sum, t) => sum + t.similarity, 0) / validTerms.length;
      }

      return results;

    } catch (error) {
      return {
        imagePath,
        documentType,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}