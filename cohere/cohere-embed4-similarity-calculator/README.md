# Cohere Embed v4.0 Image-Text Similarity Calculator

A Node.js tool that uses Cohere Embed v4.0 to calculate similarity between image content and text queries.

## 🎯 Purpose

This tool properly vectorizes content contained in images and calculates similarity scores with related text queries.

### Calculation Examples
- Image with EC site requirements document → Similarity with "EC requirements" query: 0.823456
- System design diagram → Similarity with "system architecture" query: 0.765432
- Japanese document → Similarity with Japanese query: 0.689012

## 📁 Project Structure

```
embed-4/
├── src/
│   ├── image-processor.js        # Image preprocessing (Base64 conversion, etc.)
│   ├── cohere-embedding.js       # Cohere API integration
│   ├── similarity-calculator.js  # Similarity calculation engine
│   └── report-generator.js       # Report generation
├── images/samples/               # Test images
├── reports/                      # Calculation result reports
├── simple-similarity.js          # Simple similarity calculation script
├── validate-embeddings.js        # Detailed validation script
├── package.json                  # Project configuration (Node.js v24.8.0 specified)
├── .env.example                  # Environment variable template
└── README.md
```

## 🚀 Setup

### 1. Check Node.js Version
```bash
# Check current Node.js version
node --version  # Confirm v24.8.0 is displayed

# If not v24.8.0, please install Node.js v24.8.0
# Download from https://nodejs.org/en/download/
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variable Configuration
```bash
cp .env.example .env
# Edit the .env file and set your Cohere API key
```

### 4. Get Cohere API Key
1. Access [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)
2. Get API key
3. Set it in the `.env` file

## 💻 Usage

### Simple Similarity Calculation
```bash
# Single query
npm run similarity ./images/ec-requirements.png "EC requirements"

# Batch calculation for multiple queries
npm run similarity ./images/ec-requirements.png "EC site" "requirements" "cooking recipe"
```

### Detailed Similarity Analysis
```bash
npm run validate
```

### Direct Execution
```bash
# Simple calculation
node simple-similarity.js ./images/ec-requirements.png "EC requirements"

# Detailed analysis
node validate-embeddings.js
```

## 🔍 Calculation Features

### 1. Basic Similarity Calculation
Calculate numerical similarity between image content and related text queries

```javascript
const calculator = new SimilarityCalculator();
const result = await calculator.calculateSimilarity(
  './images/samples/ec-requirements.png',
  'EC requirements'
);
console.log(`Similarity: ${result.similarity.toFixed(6)}`); // Example: 0.823456
```

### 2. Batch Calculation for Multiple Queries
Calculate similarity scores for multiple text queries against a single image

```javascript
const testCases = [
  {
    imagePath: './images/samples/ec-requirements.png',
    description: 'EC Site Requirements Document',
    textQueries: ['EC requirements', 'E-commerce system specifications', 'cooking recipe']
  }
];
const results = await calculator.calculateMultipleSimilarities(testCases);
```

### 3. Document Content Similarity Calculation
Measure numerical relevance to technical terms for specific document types

```javascript
await calculator.calculateDocumentContentSimilarity(
  './images/samples/ec-requirements.png',
  'EC Site Requirements',
  ['User management', 'Product management', 'Payment system']
);
```

### 4. Semantic Similarity Calculation
Measure numerical conceptual understanding of image content

```javascript
await calculator.calculateSemanticSimilarity(
  imagePath,
  [
    { text: 'Website', category: 'Platform' },
    { text: 'Functional requirements', category: 'Requirements' }
  ]
);
```

## 📊 Calculation Results

### Console Output Example (Simple Calculation)
```
🚀 Starting image-text similarity calculation...

Image: ./images/ec-requirements.png
Query: "EC requirements"
Calculating...

✅ Calculation complete!
==================================================
Similarity Score: 0.823456
Cosine Similarity (Range 0-1, closer to 1 means more similar)
==================================================
Interpretation: 🔥 Very high relevance
```

### Console Output Example (Multiple Queries)
```
Similarity Ranking:
1. 🥇 "EC requirements": 0.823456
2. 🥈 "E-commerce system specifications": 0.687234
3. 🥉 "Requirements document": 0.654321
4. 📝 "Cooking recipe": 0.123456

Statistics:
  Average Similarity: 0.572117
  Max Similarity: 0.823456
  Min Similarity: 0.123456
```

### Report Files
- **JSON format**: `reports/text-image-validation-{timestamp}.json`
- **Text format**: `reports/text-image-validation-{timestamp}.txt`

## ⚙️ Configuration Options

### Batch Size
```javascript
const batchSize = 10; // Adjust according to API limits
```

### Similarity Interpretation Levels
```javascript
// Interpretation is automatically displayed in code
// 0.8 and above: 🔥 Very high relevance
// 0.6-0.8: ⚡ High relevance  
// 0.4-0.6: 💡 Medium relevance
// 0.2-0.4: 🤔 Low relevance
// Below 0.2: ❌ Almost no relevance
```

## 🛠️ API Classes

### ImageProcessor
- Image preprocessing (Base64 encoding, resizing, etc.)
- Image validation compliant with Cohere restrictions

### CohereEmbedding
- Integration with Cohere Embed v4.0 API
- Image and text embedding retrieval
- Similarity calculation (cosine similarity, Euclidean distance)

### SimilarityCalculator
- Similarity calculation between images and text
- Batch calculation for multiple queries
- Semantic similarity evaluation
- Document content similarity measurement

### ReportGenerator
- Report generation functionality (JSON/text format)
- Similarity matrix output

## 📈 Calculation Metrics

- **Similarity**: Cosine similarity in range 0.0-1.0 (closer to 1 means more similar)
- **Interpretation Levels**: 
  - 🔥 Very high relevance (0.8 and above)
  - ⚡ High relevance (0.6-0.8)  
  - 💡 Medium relevance (0.4-0.6)
  - 🤔 Low relevance (0.2-0.4)
  - ❌ Almost no relevance (below 0.2)
- **Statistics**: Average similarity, maximum and minimum similarity

## 🔧 Troubleshooting

### Common Issues

1. **API Key Error**
   - Check API key configuration in `.env` file
   - Verify key validity in Cohere Dashboard

2. **Image Loading Error**
   - Check image file path
   - Verify supported format (PNG, JPEG)
   - Check file size limit (5MB or less)

3. **Memory Error**
   - Reduce batch size
   - Reduce image size