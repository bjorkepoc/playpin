const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets");
const sizes = [16, 32, 48, 128];

fs.mkdirSync(outDir, { recursive: true });

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function blend(bottom, top) {
  const alpha = top[3] / 255;
  return [
    Math.round(top[0] * alpha + bottom[0] * (1 - alpha)),
    Math.round(top[1] * alpha + bottom[1] * (1 - alpha)),
    Math.round(top[2] * alpha + bottom[2] * (1 - alpha)),
    255,
  ];
}

function insideRoundedRect(x, y, size, radius) {
  const cx = x < radius ? radius : x > size - radius ? size - radius : x;
  const cy = y < radius ? radius : y > size - radius ? size - radius : y;
  return Math.hypot(x - cx, y - cy) <= radius;
}

function insideTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function draw(size) {
  const rows = [];
  const radius = size * 0.24;
  const scale = size / 128;

  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;

    for (let x = 0; x < size; x += 1) {
      const i = 1 + x * 4;
      const nx = x / (size - 1);
      const ny = y / (size - 1);
      let color = [0, 0, 0, 0];

      if (insideRoundedRect(x + 0.5, y + 0.5, size, radius)) {
        color = [
          Math.round(255 - 55 * ny),
          Math.round(79 - 53 * ny),
          Math.round(114 - 50 * nx),
          255,
        ];
      }

      const px = x / scale;
      const py = y / scale;

      if (insideTriangle(px, py, 37, 33, 37, 95, 88, 64)) {
        color = blend(color, [255, 255, 255, 255]);
      }

      const pinDistance = Math.hypot(px - 76, py - 47);
      const stemDistance = Math.abs(px - 76);
      if (pinDistance <= 9 || (stemDistance <= 4.2 && py >= 56 && py <= 96)) {
        color = blend(color, [255, 255, 255, 255]);
      }

      row[i] = color[0];
      row[i + 1] = color[1];
      row[i + 2] = color[2];
      row[i + 3] = color[3];
    }

    rows.push(row);
  }

  return Buffer.concat(rows);
}

function writePng(file, size) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(draw(size), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  fs.writeFileSync(file, png);
}

for (const size of sizes) {
  writePng(path.join(outDir, `icon-${size}.png`), size);
}

console.log(`Wrote ${sizes.length} PlayPin icons.`);
