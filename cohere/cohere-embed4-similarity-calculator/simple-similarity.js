#!/usr/bin/env node

import { SimilarityCalculator } from './src/similarity-calculator.js';
import fs from 'fs/promises';

async function calculateSimilarity(imagePath, query) {
  console.log('🚀 Starting image-text similarity calculation...\n');
  
  try {
    const calculator = new SimilarityCalculator();
    
    console.log(`Image: ${imagePath}`);
    console.log(`Query: "${query}"`);
    console.log('Calculating...\n');
    
    const result = await calculator.calculateSimilarity(imagePath, query);
    
    if (result.error) {
      console.error('❌ An error occurred:', result.error);
      return;
    }
    
    console.log('✅ Calculation complete!');
    console.log('=' .repeat(50));
    console.log(`Similarity Score: ${result.similarity.toFixed(6)}`);
    console.log(`Cosine Similarity (Range 0-1, closer to 1 means more similar)`);
    console.log('=' .repeat(50));
    
    // Display similarity interpretation
    let interpretation;
    if (result.similarity >= 0.8) {
      interpretation = '🔥 Very high relevance';
    } else if (result.similarity >= 0.6) {
      interpretation = '⚡ High relevance';
    } else if (result.similarity >= 0.4) {
      interpretation = '💡 Medium relevance';
    } else if (result.similarity >= 0.2) {
      interpretation = '🤔 Low relevance';
    } else {
      interpretation = '❌ Almost no relevance';
    }
    
    console.log(`Interpretation: ${interpretation}\n`);
    
    // Detailed information
    console.log('📊 Detailed Information:');
    console.log(`Image Information:`);
    console.log(`  - Filename: ${result.imageMetadata.filename || 'N/A'}`);
    console.log(`  - Size: ${result.imageMetadata.width || 'N/A'}x${result.imageMetadata.height || 'N/A'}`);
    console.log(`  - Format: ${result.imageMetadata.format || 'N/A'}`);
    console.log(`Embedding Information:`);
    console.log(`  - Image Vector Dimensions: ${result.imageMetadata.dimensions || 'N/A'}`);
    console.log(`  - Text Vector Dimensions: ${result.textMetadata.dimensions || 'N/A'}`);
    console.log(`  - Model: ${result.imageMetadata.model || 'N/A'}`);

  } catch (error) {
    console.error('❌ An error occurred during processing:', error.message);
    process.exit(1);
  }
}

async function calculateMultipleSimilarities(imagePath, queries) {
  console.log('🚀 Starting similarity calculation for image with multiple queries...\n');
  
  try {
    const calculator = new SimilarityCalculator();
    
    console.log(`Image: ${imagePath}`);
    console.log(`Number of queries: ${queries.length}\n`);
    
    const results = [];
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`[${i + 1}/${queries.length}] Calculating "${query}"...`);
      
      const result = await calculator.calculateSimilarity(imagePath, query);
      
      if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else {
        console.log(`  ✅ Similarity: ${result.similarity.toFixed(6)}`);
      }
      
      results.push(result);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Results Summary');
    console.log('='.repeat(60));
    
    // Sort results by similarity
    const validResults = results.filter(r => !r.error);
    validResults.sort((a, b) => b.similarity - a.similarity);
    
    console.log('Similarity Ranking:');
    validResults.forEach((result, index) => {
      const rank = index + 1;
      const score = result.similarity.toFixed(6);
      let badge = '';
      
      if (result.similarity >= 0.8) badge = '🥇';
      else if (result.similarity >= 0.6) badge = '🥈';  
      else if (result.similarity >= 0.4) badge = '🥉';
      else badge = '📝';
      
      console.log(`${rank}. ${badge} "${result.textQuery}": ${score}`);
    });
    
    if (validResults.length > 0) {
      const avgSimilarity = validResults.reduce((sum, r) => sum + r.similarity, 0) / validResults.length;
      const maxSimilarity = Math.max(...validResults.map(r => r.similarity));
      const minSimilarity = Math.min(...validResults.map(r => r.similarity));
      
      console.log(`\nStatistics:`);
      console.log(`  Average Similarity: ${avgSimilarity.toFixed(6)}`);
      console.log(`  Max Similarity: ${maxSimilarity.toFixed(6)}`);
      console.log(`  Min Similarity: ${minSimilarity.toFixed(6)}`);
    }
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.log(`\nError Count: ${errors.length}`);
    }

  } catch (error) {
    console.error('❌ An error occurred during processing:', error.message);
    process.exit(1);
  }
}

// Process command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage:');
  console.log('  Single query: node simple-similarity.js <image_path> "<query>"');
  console.log('  Multiple queries: node simple-similarity.js <image_path> "<query1>" "<query2>" ...');
  console.log('');
  console.log('Examples:');
  console.log('  node simple-similarity.js ./images/ec-requirements.png "EC requirements"');
  console.log('  node simple-similarity.js ./images/ec-requirements.png "EC site" "requirements" "cooking recipe"');
  process.exit(1);
}

const imagePath = args[0];
const queries = args.slice(1);

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  // Create directory
  try {
    await fs.mkdir('./reports', { recursive: true });
  } catch (error) {
    // Ignore if already exists
  }
  
  if (queries.length === 1) {
    await calculateSimilarity(imagePath, queries[0]);
  } else {
    await calculateMultipleSimilarities(imagePath, queries);
  }
}