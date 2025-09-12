#!/usr/bin/env node

import { SimilarityCalculator } from './src/similarity-calculator.js';
import { ReportGenerator } from './src/report-generator.js';
import fs from 'fs/promises';

async function runTextImageValidation() {
  console.log('🚀 Starting Cohere Embed v4.0 image-text validation...\n');
  
  try {
    const calculator = new SimilarityCalculator();
    
    // Example of EC site requirements
    const testCases = [
      {
        imagePath: './images/samples/ec-requirements.png', // Replace with actual image path
        description: 'EC Site Requirements Document',
        textQueries: [
          'EC requirements definition',
          'E-commerce system specifications',
          'Requirements definition document',
          'Online shopping functionality',
          'Cooking recipe',      // Unrelated query
          'Travel plan'        // Unrelated query
        ]
      }
      // Other test cases can be added here
    ];

    // Multiple text-image pair similarity calculation
    const results = await calculator.calculateMultipleSimilarities(testCases);
    
    // Detailed similarity calculation with document content
    const documentValidation = await calculator.calculateDocumentContentSimilarity(
      './images/samples/ec-requirements.png',
      'EC Site Requirements',
      ['User management', 'Product management', 'Payment system', 'Security', 'Database design']
    );

    // Semantic similarity calculation
    const semanticValidation = await calculator.calculateSemanticSimilarity(
      './images/samples/ec-requirements.png',
      [
        { text: 'Website', category: 'Platform' },
        { text: 'User interface', category: 'UI/UX' },
        { text: 'Data flow', category: 'Architecture' },
        { text: 'Functional requirements', category: 'Requirements' },
        { text: 'Non-functional requirements', category: 'Requirements' }
      ]
    );

    // Generate report
    const fullReport = {
      textImageValidation: results,
      documentValidation,
      semanticValidation,
      timestamp: new Date().toISOString()
    };

    // Console display
    displayTextImageReport(fullReport);
    
    // File save
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await ReportGenerator.generateJsonReport(
      fullReport, 
      `./reports/text-image-validation-${timestamp}.json`
    );
    
    await ReportGenerator.generateTextReport(
      fullReport,
      `./reports/text-image-validation-${timestamp}.txt`
    );

    console.log('\\n✅ Validation complete! Reports saved to reports directory.');

  } catch (error) {
    console.error('❌ An error occurred during validation:', error.message);
    process.exit(1);
  }
}

function displayTextImageReport(report) {
  console.log('\\n' + '='.repeat(80));
  console.log('           Image-Text Matching Validation Report');
  console.log('='.repeat(80));

  // Text-image pair validation results
  if (report.textImageValidation) {
    const summary = report.textImageValidation.summary;
    console.log('\\n📊 Text-Image Similarity Calculation Results');
    console.log('-'.repeat(40));
    console.log(`Total Cases: ${summary.totalCases}`);
    console.log(`Total Queries: ${summary.totalQueries}`);
    console.log(`Success: ${summary.overallSuccessful} ✓`);
    console.log(`Errors: ${summary.overallErrors} ❌`);
    console.log(`Average Similarity: ${summary.overallAverageSimilarity.toFixed(4)}`);
    console.log(`Max Similarity: ${summary.overallMaxSimilarity.toFixed(4)}`);
    console.log(`Min Similarity: ${summary.overallMinSimilarity.toFixed(4)}`);

    // Details for each case
    console.log('\\n📋 Results by Case:');
    for (const caseResult of report.textImageValidation.results) {
      console.log(`\\n  ${caseResult.description}:`);
      console.log(`    Average Similarity: ${caseResult.summary.averageSimilarity.toFixed(4)}`);
      console.log(`    Max Similarity: ${caseResult.summary.maxSimilarity.toFixed(4)}`);
      console.log(`    Min Similarity: ${caseResult.summary.minSimilarity.toFixed(4)}`);
      
      for (const query of caseResult.queries) {
        if (!query.error) {
          console.log(`    "${query.textQuery}": ${query.similarity.toFixed(4)}`);
        } else {
          console.log(`    "${query.textQuery}": Error - ${query.error}`);
        }
      }
    }
  }

  // Document content matching results
  if (report.documentValidation && !report.documentValidation.error) {
    console.log('\\n📄 Document Content Matching Results');
    console.log('-'.repeat(40));
    const docSummary = report.documentValidation.summary;
    console.log(`Document Type: ${report.documentValidation.documentType}`);
    console.log(`Strong Matches: ${docSummary.strongMatches}`);
    console.log(`Moderate Matches: ${docSummary.moderateMatches}`);
    console.log(`Weak Matches: ${docSummary.weakMatches}`);
    console.log(`Average Relevance: ${docSummary.averageRelevance.toFixed(3)}`);

    console.log('\\n  Results by Term:');
    for (const term of report.documentValidation.keyTerms) {
      if (!term.error) {
        const strengthIcon = term.matchStrength === 'strong' ? '🔥' : 
                           term.matchStrength === 'moderate' ? '⚡' : '💡';
        console.log(`    "${term.term}": ${term.similarity.toFixed(3)} ${strengthIcon} ${term.matchStrength}`);
      }
    }
  }

  // Semantic understanding validation results
  if (report.semanticValidation && !report.semanticValidation.error) {
    console.log('\\n🧠 Semantic Understanding Validation Results');
    console.log('-'.repeat(40));
    const semSummary = report.semanticValidation.summary;
    console.log(`High Confidence: ${semSummary.highConfidence}`);
    console.log(`Medium Confidence: ${semSummary.mediumConfidence}`);
    console.log(`Low Confidence: ${semSummary.lowConfidence}`);
    console.log(`Average Confidence: ${semSummary.averageConfidence.toFixed(3)}`);
  }
}

async function setupDirectories() {
  try {
    await fs.mkdir('./reports', { recursive: true });
    await fs.mkdir('./images/samples', { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  await setupDirectories();
  await runTextImageValidation();
}