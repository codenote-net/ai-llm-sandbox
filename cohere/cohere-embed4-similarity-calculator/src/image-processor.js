import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export class ImageProcessor {
  static supportedFormats = ['png', 'jpg', 'jpeg'];
  static maxFileSize = 5 * 1024 * 1024; // 5MB
  static minDimension = 56;
  static maxPixels = 2458624;

  static async validateImage(imagePath) {
    try {
      const stats = await fs.stat(imagePath);
      
      if (stats.size > this.maxFileSize) {
        throw new Error(`Image file size exceeds limit (5MB): ${stats.size} bytes`);
      }

      const metadata = await sharp(imagePath).metadata();
      const { width, height, format } = metadata;
      
      if (!this.supportedFormats.includes(format)) {
        throw new Error(`Unsupported image format: ${format}`);
      }

      if (width < this.minDimension || height < this.minDimension) {
        throw new Error(`Image size too small: ${width}x${height} (minimum: ${this.minDimension}x${this.minDimension})`);
      }

      if (width * height > this.maxPixels) {
        throw new Error(`Image size too large: ${width}x${height} (maximum: ${this.maxPixels} pixels)`);
      }

      return { width, height, format, size: stats.size };
    } catch (error) {
      throw new Error(`Image validation failed: ${error.message}`);
    }
  }

  static async processImage(imagePath) {
    await this.validateImage(imagePath);
    
    try {
      const buffer = await fs.readFile(imagePath);
      const metadata = await sharp(imagePath).metadata();
      
      // Determine MIME type
      const mimeType = this.getMimeType(metadata.format);
      
      // Base64 encode
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      return {
        dataUrl,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: buffer.length,
          filename: path.basename(imagePath)
        }
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  static async processMultipleImages(imagePaths) {
    const results = [];
    const errors = [];

    for (const imagePath of imagePaths) {
      try {
        const result = await this.processImage(imagePath);
        results.push({
          path: imagePath,
          ...result
        });
      } catch (error) {
        errors.push({
          path: imagePath,
          error: error.message
        });
      }
    }

    return { results, errors };
  }

  static getMimeType(format) {
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg'
    };
    return mimeTypes[format] || 'image/jpeg';
  }

  static async resizeIfNeeded(imagePath, maxWidth = 1024, maxHeight = 1024) {
    try {
      const metadata = await sharp(imagePath).metadata();
      
      if (metadata.width <= maxWidth && metadata.height <= maxHeight) {
        return this.processImage(imagePath);
      }

      const resizedBuffer = await sharp(imagePath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer();

      const mimeType = this.getMimeType(metadata.format);
      const base64 = resizedBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return {
        dataUrl,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: resizedBuffer.length,
          filename: path.basename(imagePath),
          resized: true
        }
      };
    } catch (error) {
      throw new Error(`Image resize failed: ${error.message}`);
    }
  }
}