/**
 * Helpers for the image compressor: which format a compression writes, and
 * whether a GIF is animated (canvas can only keep its first frame).
 */

export const LOSSY_TYPES = new Set(['image/jpeg', 'image/webp']);

/**
 * The output MIME type. `choice` is 'original' or a MIME type. Canvas can't
 * write GIF, so a GIF kept "as original" becomes PNG.
 */
export const resolveOutputType = (inputType, choice = 'original') => {
  if (choice && choice !== 'original') return choice;
  if (inputType === 'image/jpeg') return 'image/jpeg';
  return 'image/png';
};

/** True when the quality setting changes the result (lossy formats only). */
export const isLossyType = (type) => LOSSY_TYPES.has(type);

/**
 * Number of frames (image descriptors) in a GIF, or 0 when the bytes aren't a
 * GIF. Walks the block structure rather than searching for byte patterns.
 */
export const countGifFrames = (input) => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const sig = String.fromCharCode(...bytes.slice(0, 6));
  if (sig !== 'GIF87a' && sig !== 'GIF89a') return 0;
  let i = 13;
  const packed = bytes[10];
  if (packed & 0x80) i += 3 * 2 ** ((packed & 0x07) + 1); // global colour table
  const skipSubBlocks = () => {
    while (i < bytes.length) {
      const size = bytes[i];
      i += 1;
      if (size === 0) return;
      i += size;
    }
  };
  let frames = 0;
  while (i < bytes.length) {
    const block = bytes[i];
    if (block === 0x3b) break; // trailer
    if (block === 0x21) {
      i += 2; // introducer + label
      skipSubBlocks();
    } else if (block === 0x2c) {
      frames++;
      const localPacked = bytes[i + 9];
      i += 10;
      if (localPacked & 0x80) i += 3 * 2 ** ((localPacked & 0x07) + 1);
      i += 1; // LZW minimum code size
      skipSubBlocks();
    } else {
      break; // corrupt or unknown: stop counting
    }
  }
  return frames;
};
