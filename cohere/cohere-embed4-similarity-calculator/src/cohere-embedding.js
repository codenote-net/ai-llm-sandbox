import { CohereClient } from 'cohere-ai';
import { ImageProcessor } from './image-processor.js';
import dotenv from 'dotenv';

dotenv.config();

export class CohereEmbedding {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.COHERE_API_KEY;
    if (!this.apiKey) {
      throw new Error('Cohere API key is not set. Please set the environment variable COHERE_API_KEY or specify it in the constructor.');
    }
    
    this.cohere = new CohereClient({
      token: this.apiKey,
    });
    
    this.model = 'embed-v4.0';
  }

  async getImageEmbedding(imagePath) {
    try {
      console.log(`Getting image embedding: ${imagePath}`);
      
      const processedImage = await ImageProcessor.processImage(imagePath);
      
      const response = await this.cohere.embed({
        model: this.model,
        images: [processedImage.dataUrl],
        inputType: 'image',
        embeddingTypes: ['float']
      });

      return {
        embedding: response.embeddings.float[0],
        metadata: {
          imagePath,
          ...processedImage.metadata,
          model: this.model,
          dimensions: response.embeddings.float[0].length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get image embedding: ${error.message}`);
    }
  }

  async getMultipleImageEmbeddings(imagePaths, batchSize = 10) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < imagePaths.length; i += batchSize) {
      const batch = imagePaths.slice(i, i + batchSize);
      console.log(`Batch processing (${i + 1}-${Math.min(i + batchSize, imagePaths.length)}/${imagePaths.length})`);
      
      try {
        const processResults = await ImageProcessor.processMultipleImages(batch);
        
        if (processResults.errors.length > 0) {
          errors.push(...processResults.errors);
        }
        
        if (processResults.results.length > 0) {
          const dataUrls = processResults.results.map(r => r.dataUrl);
          
          const response = await this.cohere.embed({
            model: this.model,
            images: dataUrls,
            inputType: 'image',
            embeddingTypes: ['float']
          });

          response.embeddings.float.forEach((embedding, index) => {
            results.push({
              embedding,
              metadata: {
                imagePath: processResults.results[index].path,
                ...processResults.results[index].metadata,
                model: this.model,
                dimensions: embedding.length,
                timestamp: new Date().toISOString()
              }
            });
          });
        }
      } catch (error) {
        batch.forEach(path => {
          errors.push({
            path,
            error: `Batch processing error: ${error.message}`
          });
        });
      }
      
      // Wait considering API rate limits
      if (i + batchSize < imagePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { results, errors };
  }

  async getImageEmbeddingWithText(imagePath, text = '', locale = 'ja') {
    try {
      console.log(`Getting image and text embedding: ${imagePath}`);
      
      const processedImage = await ImageProcessor.processImage(imagePath);
      
      const inputs = [processedImage.dataUrl];
      if (text.trim()) {
        inputs.push(text);
      }
      
      const response = await this.cohere.embed({
        model: this.model,
        images: [processedImage.dataUrl],
        texts: text.trim() ? [text] : [],
        inputType: 'image',
        embeddingTypes: ['float']
      });

      return {
        embedding: response.embeddings.float[0],
        metadata: {
          imagePath,
          text: text || null,
          locale,
          ...processedImage.metadata,
          model: this.model,
          dimensions: response.embeddings.float[0].length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get image+text embedding: ${error.message}`);
    }
  }

  static cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions do not match');
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  static euclideanDistance(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions do not match');
    }

    const squaredDifferences = vecA.reduce((sum, a, i) => sum + Math.pow(a - vecB[i], 2), 0);
    return Math.sqrt(squaredDifferences);
  }

  async compareImages(imagePath1, imagePath2) {
    try {
      console.log(`Comparing images: ${imagePath1} vs ${imagePath2}`);
      
      const [result1, result2] = await Promise.all([
        this.getImageEmbedding(imagePath1),
        this.getImageEmbedding(imagePath2)
      ]);

      const similarity = CohereEmbedding.cosineSimilarity(
        result1.embedding, 
        result2.embedding
      );
      
      const distance = CohereEmbedding.euclideanDistance(
        result1.embedding, 
        result2.embedding
      );

      return {
        similarity,
        distance,
        image1: result1.metadata,
        image2: result2.metadata,
        comparison: {
          timestamp: new Date().toISOString(),
          model: this.model
        }
      };
    } catch (error) {
      throw new Error(`Image comparison failed: ${error.message}`);
    }
  }
}