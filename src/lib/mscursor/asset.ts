import { ImageFormat, type CursorEntry, type ImageInfo } from './types';

export class CursorImageConverter {
  public detectImageFormat(imageData: ArrayBuffer): ImageInfo {
    const bytes = new Uint8Array(imageData);

    // Check for PNG signature (89 50 4E 47 0D 0A 1A 0A)
    if (
      bytes.length >= 8
      && bytes[0] === 0x89
      && bytes[1] === 0x50
      && bytes[2] === 0x4e
      && bytes[3] === 0x47
      && bytes[4] === 0x0d
      && bytes[5] === 0x0a
      && bytes[6] === 0x1a
      && bytes[7] === 0x0a
    ) {
      return {
        format: ImageFormat.PNG,
        needsConversion: false,
        mimeType: 'image/png',
      };
    }

    // Check for ICO signature (00 00 01 00)
    if (
      bytes.length >= 4
      && bytes[0] === 0x00
      && bytes[1] === 0x00
      && bytes[2] === 0x01
      && bytes[3] === 0x00
    ) {
      return {
        format: ImageFormat.ICO,
        needsConversion: false,
        mimeType: 'image/x-icon',
      };
    }

    // Check for BITMAPINFOHEADER (starts with header size, usually 40 bytes = 0x28)
    if (bytes.length >= 4) {
      const headerSize = new DataView(imageData).getUint32(0, true);
      if (headerSize === 40 || headerSize === 108 || headerSize === 124) {
        return {
          format: ImageFormat.BITMAP,
          needsConversion: true,
          mimeType: 'image/x-icon',
        };
      }
    }

    return {
      format: ImageFormat.UNKNOWN,
      needsConversion: true,
      mimeType: 'image/x-icon',
    };
  }

  public bitmapToICO(cursor: CursorEntry): ArrayBuffer {
    const imageSize = cursor.imageData.byteLength;
    const totalSize = 22 + imageSize; // ICO header (6) + directory entry (16) + image data

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    let offset = 0;

    // ICO Header
    view.setUint16(offset, 0, true); // Reserved (0)
    view.setUint16(offset + 2, 1, true); // Type (1 for ICO)
    view.setUint16(offset + 4, 1, true); // Number of images (1)
    offset += 6;

    // Directory Entry
    bytes[offset] = cursor.width === 256 ? 0 : cursor.width;
    bytes[offset + 1] = cursor.height === 256 ? 0 : cursor.height;
    bytes[offset + 2] = cursor.colors || 0;
    bytes[offset + 3] = 0; // Reserved
    view.setUint16(offset + 4, 1, true); // Color planes

    // Try to determine bit depth from bitmap header, fallbacks to 32
    let bitDepth = 32;
    if (cursor.imageData.byteLength >= 14) {
      const bmpView = new DataView(cursor.imageData);
      try {
        bitDepth = bmpView.getUint16(14, true) || 32; // Bit depth is at offset 14 in BITMAPINFOHEADER
      } catch (e) {
        console.warn(e, "Using fallback bit depth of 32")
        bitDepth = 32;
      }
    }

    view.setUint16(offset + 6, bitDepth, true); // Bits per pixel
    view.setUint32(offset + 8, imageSize, true); // Image size
    view.setUint32(offset + 12, 22, true); // Image offset (header + directory)
    offset += 16;

    bytes.set(new Uint8Array(cursor.imageData), offset);

    return buffer;
  }

  public createDIBFromBitmap(cursor: CursorEntry): ArrayBuffer {
    const bmpData = new Uint8Array(cursor.imageData);
    const view = new DataView(cursor.imageData);

    // Read BITMAPINFOHEADER
    const headerSize = view.getUint32(0, true);
    const width = view.getInt32(4, true);
    const height = view.getInt32(8, true);
    const bitCount = view.getUint16(14, true);

    // For cursors, height in DIB is doubled (includes AND mask)
    const actualHeight = Math.abs(height) / 2;

    // Calculate row size (must be multiple of 4 bytes)
    const rowSize = Math.floor((bitCount * width + 31) / 32) * 4;
    const colorTableSize = bitCount <= 8 ? (1 << bitCount) * 4 : 0;

    // Create new DIB with corrected height
    const newHeaderSize = 40; // Standard BITMAPINFOHEADER
    const newImageSize = rowSize * actualHeight * 2; // XOR + AND masks
    const totalSize = newHeaderSize + colorTableSize + newImageSize;

    const buffer = new ArrayBuffer(totalSize);
    const newView = new DataView(buffer);
    const newBytes = new Uint8Array(buffer);

    // Write corrected BITMAPINFOHEADER
    newView.setUint32(0, newHeaderSize, true); // Header size
    newView.setInt32(4, width, true); // Width
    newView.setInt32(8, actualHeight * 2, true); // Height (doubled for cursor)
    newView.setUint16(12, 1, true); // Planes
    newView.setUint16(14, bitCount, true); // Bit count
    newView.setUint32(16, 0, true); // No compression
    newView.setUint32(20, newImageSize, true); // Image size
    newView.setInt32(24, 0, true); // X pixels per meter
    newView.setInt32(28, 0, true); // Y pixels per meter
    newView.setUint32(32, colorTableSize / 4, true); // Colors used
    newView.setUint32(36, 0, true); // Important colors

    // Copy color table and image data
    if (headerSize < bmpData.length) {
      newBytes.set(bmpData.slice(headerSize), newHeaderSize);
    }

    return buffer;
  }

  public cursorToImageURL(cursor: CursorEntry): string {
    const imageInfo = this.detectImageFormat(cursor.imageData);

    let finalBuffer: ArrayBuffer;
    let mimeType: string;

    switch (imageInfo.format) {
      case ImageFormat.PNG:
        finalBuffer = cursor.imageData;
        mimeType = 'image/png';
        break;

      case ImageFormat.ICO:
        finalBuffer = cursor.imageData;
        mimeType = 'image/x-icon';
        break;

      case ImageFormat.BITMAP:
      case ImageFormat.UNKNOWN:
      default:
        // Convert bitmap to ICO
        try {
          // Try creating DIB
          const dibBuffer = this.createDIBFromBitmap(cursor);
          finalBuffer = this.createICOFromDIB(cursor, dibBuffer);
          mimeType = 'image/x-icon';
        } catch (e) {
          console.warn('DIB conversion failed, trying simple ICO conversion:', e);
          // Fallback to ICO conversion
          finalBuffer = this.bitmapToICO(cursor);
          mimeType = 'image/x-icon';
        }
        break;
    }

    const blob = new Blob([finalBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  private createICOFromDIB(cursor: CursorEntry, dibData: ArrayBuffer): ArrayBuffer {
    const dibSize = dibData.byteLength;
    const totalSize = 22 + dibSize; // ICO header + directory + DIB

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // ICO Header
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // Type (1 = ICO)
    view.setUint16(4, 1, true); // Image count

    // Directory Entry
    bytes[6] = cursor.width === 256 ? 0 : cursor.width;
    bytes[7] = cursor.height === 256 ? 0 : cursor.height;
    bytes[8] = cursor.colors || 0;
    bytes[9] = 0; // Reserved
    view.setUint16(10, 1, true); // Color planes
    view.setUint16(12, 32, true); // Bits per pixel
    view.setUint32(14, dibSize, true); // DIB size
    view.setUint32(18, 22, true); // DIB offset

    bytes.set(new Uint8Array(dibData), 22);

    return buffer;
  }

  public getCursorImageInfo(cursor: CursorEntry): object {
    const imageInfo = this.detectImageFormat(cursor.imageData);
    const bytes = new Uint8Array(cursor.imageData, 0, Math.min(40, cursor.imageData.byteLength));

    const info: Record<string, unknown> = {
      format: imageInfo.format,
      size: cursor.imageData.byteLength,
      dimensions: `${cursor.width}x${cursor.height}`,
      hotspot: `${cursor.hotspotX},${cursor.hotspotY}`,
      colors: cursor.colors,
      needsConversion: imageInfo.needsConversion,
      hexDump: Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' '),
    };

    // Try to extract bitmap info if it's a bitmap
    if (imageInfo.format === ImageFormat.BITMAP && cursor.imageData.byteLength >= 40) {
      const view = new DataView(cursor.imageData);
      try {
        info.bitmapInfo = {
          headerSize: view.getUint32(0, true),
          width: view.getInt32(4, true),
          height: view.getInt32(8, true),
          planes: view.getUint16(12, true),
          bitCount: view.getUint16(14, true),
          compression: view.getUint32(16, true),
          imageSize: view.getUint32(20, true),
        };
      } catch (e) {
        info.bitmapError = e;
      }
    }

    return info;
  }

  public convertCursorImages(
    cursors: CursorEntry[],
  ): Array<{ cursor: CursorEntry; url: string; info: object }> {
    return cursors.map((cursor) => ({
      cursor,
      url: this.cursorToImageURL(cursor),
      info: this.getCursorImageInfo(cursor),
    }));
  }
}
