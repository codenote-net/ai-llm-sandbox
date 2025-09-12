import fs from 'fs/promises';
import path from 'path';

export class ReportGenerator {
  static async generateTextReport(validationResult, outputPath = null) {
    const report = this.buildTextReport(validationResult);
    
    if (outputPath) {
      await fs.writeFile(outputPath, report, 'utf-8');
      console.log(`Text report saved: ${outputPath}`);
    }
    
    return report;
  }

  static async generateJsonReport(validationResult, outputPath = null) {
    const jsonReport = JSON.stringify(validationResult, null, 2);
    
    if (outputPath) {
      await fs.writeFile(outputPath, jsonReport, 'utf-8');
      console.log(`JSON report saved: ${outputPath}`);
    }
    
    return jsonReport;
  }

  static buildTextReport(validationResult) {
    let report = '';
    
    report += '=' .repeat(80) + '\n';
    report += '        Cohere Embed v4.0 Image Embedding Validation Report\n';
    report += '=' .repeat(80) + '\n';
    report += `Execution Date: ${new Date(validationResult.timestamp).toLocaleString('en-US')}\n`;
    report += `Execution Time: ${validationResult.duration ? (validationResult.duration / 1000).toFixed(2) : 'N/A'} seconds\n\n`;

    if (validationResult.error) {
      report += `❌ An error occurred: ${validationResult.error}\n\n`;
      return report;
    }

    // Configuration information
    if (validationResult.config) {
      report += '📋 Validation Settings\n';
      report += '-'.repeat(40) + '\n';
      if (validationResult.config.similarityThreshold) {
        report += `Similarity Threshold: ${validationResult.config.similarityThreshold}\n`;
      }
      if (validationResult.config.maxSimilarity) {
        report += `Maximum Similarity: ${validationResult.config.maxSimilarity}\n`;
      }
      report += '\n';
    }

    // Similar image validation
    if (validationResult.results.similarImages) {
      report += this.buildSimilarImagesSection(validationResult.results.similarImages);
    }

    // Different image validation
    if (validationResult.results.differentImages) {
      report += this.buildDifferentImagesSection(validationResult.results.differentImages);
    }

    // Japanese text validation
    if (validationResult.results.japaneseText) {
      report += this.buildJapaneseTextSection(validationResult.results.japaneseText);
    }

    // Format validation
    if (validationResult.results.formats) {
      report += this.buildFormatsSection(validationResult.results.formats);
    }

    return report;
  }

  static buildSimilarImagesSection(similarImages) {
    let section = '';
    
    section += '🔍 Similar Image Validation Results\n';
    section += '-'.repeat(40) + '\n';
    section += `Total Comparisons: ${similarImages.summary.comparisons}\n`;
    section += `Success: ${similarImages.summary.validations.passed}\n`;
    section += `Failed: ${similarImages.summary.validations.failed}\n`;
    section += `Errors: ${similarImages.summary.errors}\n`;
    section += `Average Similarity: ${similarImages.summary.statistics.averageSimilarity.toFixed(4)}\n`;
    section += `Maximum Similarity: ${similarImages.summary.statistics.maxSimilarity.toFixed(4)}\n`;
    section += `Minimum Similarity: ${similarImages.summary.statistics.minSimilarity.toFixed(4)}\n\n`;

    // Detailed results
    const comparisons = similarImages.results.filter(r => r.type === 'similarity_comparison');
    if (comparisons.length > 0) {
      section += 'Detailed Comparison Results:\n';
      for (const comp of comparisons.slice(0, 10)) { // Show only first 10 items
        section += `  ${path.basename(comp.image1)} vs ${path.basename(comp.image2)}: `;
        section += `${comp.similarity.toFixed(4)} ${comp.isSimilar ? '✓' : '✗'}\n`;
      }
      if (comparisons.length > 10) {
        section += `  ... and ${comparisons.length - 10} more\n`;
      }
    }
    section += '\n';

    return section;
  }

  static buildDifferentImagesSection(differentImages) {
    let section = '';
    
    section += '🔀 Different Image Validation Results\n';
    section += '-'.repeat(40) + '\n';
    section += `Total Comparisons: ${differentImages.summary.comparisons}\n`;
    section += `Success: ${differentImages.summary.validations.passed}\n`;
    section += `Failed: ${differentImages.summary.validations.failed}\n`;
    section += `Errors: ${differentImages.summary.errors}\n`;
    section += `Average Similarity: ${differentImages.summary.statistics.averageSimilarity.toFixed(4)}\n`;
    section += `Maximum Similarity: ${differentImages.summary.statistics.maxSimilarity.toFixed(4)}\n`;
    section += `Minimum Similarity: ${differentImages.summary.statistics.minSimilarity.toFixed(4)}\n\n`;

    // If there was unexpected similarity
    const unexpectedSimilar = differentImages.results.filter(r => r.unexpectedSimilarity);
    if (unexpectedSimilar.length > 0) {
      section += '⚠️  Detected Unexpected Similarity:\n';
      for (const comp of unexpectedSimilar) {
        section += `  ${path.basename(comp.image1)} vs ${path.basename(comp.image2)}: `;
        section += `${comp.similarity.toFixed(4)}\n`;
      }
    }
    section += '\n';

    return section;
  }

  static buildJapaneseTextSection(japaneseText) {
    let section = '';
    
    section += '🗾 Japanese Text Influence Validation Results\n';
    section += '-'.repeat(40) + '\n';
    section += `Total Validations: ${japaneseText.summary.textInfluenceResults}\n`;
    section += `Errors: ${japaneseText.summary.errors}\n`;
    section += `Average Text Influence: ${japaneseText.summary.statistics.averageTextInfluence.toFixed(4)}\n`;
    section += `Maximum Text Influence: ${japaneseText.summary.statistics.maxTextInfluence.toFixed(4)}\n`;
    section += `Minimum Text Influence: ${japaneseText.summary.statistics.minTextInfluence.toFixed(4)}\n\n`;

    // Detailed results
    const textResults = japaneseText.results.filter(r => r.type === 'text_influence');
    if (textResults.length > 0) {
      section += 'Detailed Results:\n';
      for (const result of textResults) {
        section += `  ${path.basename(result.imagePath)}:\n`;
        section += `    Text: "${result.text}"\n`;
        section += `    Influence: ${result.textInfluence.toFixed(4)}\n`;
        section += `    Similarity: ${result.similarity.toFixed(4)}\n`;
      }
    }
    section += '\n';

    return section;
  }

  static buildFormatsSection(formats) {
    let section = '';
    
    section += '📁 Format Validation Results\n';
    section += '-'.repeat(40) + '\n';
    section += `Total Files: ${formats.summary.total}\n`;
    section += `Success: ${formats.summary.successful}\n`;
    section += `Errors: ${formats.summary.errors}\n\n`;

    // Format-specific statistics
    section += 'Format-specific Statistics:\n';
    for (const [format, stats] of Object.entries(formats.summary.formats)) {
      section += `  ${format.toUpperCase()}:\n`;
      section += `    File Count: ${stats.count}\n`;
      section += `    Average Embedding Magnitude: ${stats.averageEmbeddingMagnitude.toFixed(4)}\n`;
    }
    section += '\n';

    return section;
  }

  static async generateComparisonMatrix(validationResults, outputPath) {
    // Generate similarity matrix in CSV format
    let csv = '';
    
    const comparisons = validationResults.results.similarImages?.results.filter(
      r => r.type === 'similarity_comparison'
    ) || [];

    if (comparisons.length === 0) {
      console.log('No comparison data found');
      return;
    }

    // Create image list
    const images = new Set();
    for (const comp of comparisons) {
      images.add(comp.image1);
      images.add(comp.image2);
    }
    const imageList = Array.from(images);

    // Header row
    csv += ',' + imageList.map(img => path.basename(img)).join(',') + '\n';

    // Data rows
    for (const img1 of imageList) {
      csv += path.basename(img1);
      for (const img2 of imageList) {
        if (img1 === img2) {
          csv += ',1.0000';
        } else {
          const comp = comparisons.find(c => 
            (c.image1 === img1 && c.image2 === img2) ||
            (c.image1 === img2 && c.image2 === img1)
          );
          csv += comp ? `,${comp.similarity.toFixed(4)}` : ',N/A';
        }
      }
      csv += '\n';
    }

    await fs.writeFile(outputPath, csv, 'utf-8');
    console.log(`Similarity matrix saved: ${outputPath}`);
  }

  static displayConsoleReport(validationResult) {
    console.log('\n' + '='.repeat(80));
    console.log('        Cohere Embed v4.0 Image Embedding Validation Report');
    console.log('='.repeat(80));
    console.log(`Execution Date: ${new Date(validationResult.timestamp).toLocaleString('en-US')}`);
    console.log(`Execution Time: ${validationResult.duration ? (validationResult.duration / 1000).toFixed(2) : 'N/A'} seconds\n`);

    if (validationResult.error) {
      console.log(`❌ An error occurred: ${validationResult.error}\n`);
      return;
    }

    // Display summary
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalErrors = 0;

    Object.values(validationResult.results).forEach(result => {
      if (result.summary) {
        totalTests += result.summary.comparisons || result.summary.textInfluenceResults || result.summary.total || 0;
        totalPassed += result.summary.validations?.passed || 0;
        totalFailed += result.summary.validations?.failed || 0;
        totalErrors += result.summary.errors || 0;
      }
    });

    console.log('📊 Overall Results');
    console.log('-'.repeat(40));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Success: ${totalPassed} ✓`);
    console.log(`Failed: ${totalFailed} ✗`);
    console.log(`Errors: ${totalErrors} ❌`);
    
    if (totalTests > 0) {
      const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
      console.log(`Success Rate: ${successRate}%`);
    }
    console.log();
  }
}