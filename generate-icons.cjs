const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height) {
  // Raw RGBA buffer
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (rowSize + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = width * 0.45;

      if (dist < maxDist) {
        // Cyan / Pink / Gold Cyberpunk gradient
        const t = (x + y) / (width + height);
        rawData[pxOffset] = Math.floor(10 + t * 240);     // R
        rawData[pxOffset + 1] = Math.floor(240 * (1 - t));// G
        rawData[pxOffset + 2] = 255;                      // B
        rawData[pxOffset + 3] = 255;                      // Alpha
      } else {
        // Dark metallic background
        rawData[pxOffset] = 7;
        rawData[pxOffset + 1] = 9;
        rawData[pxOffset + 2] = 14;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);

    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);

    return Buffer.concat([len, body, crc]);
  }

  function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
      }
    }
    return ~c >>> 0;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type 6 (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, 512));

console.log('PNG icons created successfully!');
