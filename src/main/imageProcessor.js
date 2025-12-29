import sharp from 'sharp';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';

export async function convertImage(inputPath, outputPath, format, options = {}) {
  try {
    if (!existsSync(inputPath)) {
      throw new Error('Input file does not exist');
    }

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const {
      quality = 80,
      width,
      height,
      preserveMetadata = true,
    } = options;

    let pipeline = sharp(inputPath);

    // Apply resizing if specified
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Handle metadata
    if (!preserveMetadata) {
      pipeline = pipeline.withMetadata({
        exif: {},
        icc: false,
      });
    }

    // Convert based on format
    switch (format.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        await pipeline
          .jpeg({ quality, mozjpeg: true })
          .toFile(outputPath);
        break;

      case 'png':
        await pipeline
          .png({ quality, compressionLevel: Math.floor((100 - quality) / 10) })
          .toFile(outputPath);
        break;

      case 'webp':
        await pipeline
          .webp({ quality })
          .toFile(outputPath);
        break;

      case 'avif':
        await pipeline
          .avif({ quality })
          .toFile(outputPath);
        break;

      case 'tiff':
      case 'tif':
        await pipeline
          .tiff({ quality })
          .toFile(outputPath);
        break;

      default:
        throw new Error(`Unsupported output format: ${format}`);
    }

    return { success: true, outputPath };
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

export async function getImageMetadata(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    return metadata;
  } catch (error) {
    throw new Error(`Failed to read image metadata: ${error.message}`);
  }
}
