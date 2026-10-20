// ============================================================================
// MTC Research Game - Sincronizador de Assets Públicos Multiplataforma
// Prepara únicamente las imágenes requeridas para el juego en public/card_redesign
// Compatible con Windows, Linux (GitHub Actions) y macOS sin junctions ni symlinks
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const srcVisualsDir = path.join(projectRoot, 'card_redesign', 'generated_visuals');
const srcBackDir = path.join(projectRoot, 'card_redesign', 'card_back');

const publicCardRedesign = path.join(projectRoot, 'public', 'card_redesign');
const destVisualsDir = path.join(publicCardRedesign, 'generated_visuals');
const destBackDir = path.join(publicCardRedesign, 'card_back');

/**
 * Comprueba si dos archivos son idénticos en tamaño, fecha o contenido binario completo.
 */
function areFilesIdentical(fileA, fileB, statA, statB) {
  if (statA.size !== statB.size) return false;
  if (Math.abs(statA.mtimeMs - statB.mtimeMs) < 1000) return true;

  // Si la fecha difiere pero el tamaño es idéntico, verificar contenido binario
  let fdA, fdB;
  try {
    fdA = fs.openSync(fileA, 'r');
    fdB = fs.openSync(fileB, 'r');
    const chunkSize = 65536; // 64 KB
    const bufA = Buffer.alloc(chunkSize);
    const bufB = Buffer.alloc(chunkSize);
    let pos = 0;
    while (pos < statA.size) {
      const readA = fs.readSync(fdA, bufA, 0, chunkSize, pos);
      const readB = fs.readSync(fdB, bufB, 0, chunkSize, pos);
      if (readA !== readB) return false;
      if (!bufA.subarray(0, readA).equals(bufB.subarray(0, readB))) return false;
      pos += readA;
    }
    return true;
  } catch {
    return false;
  } finally {
    if (fdA) fs.closeSync(fdA);
    if (fdB) fs.closeSync(fdB);
  }
}

export function syncPublicAssets() {
  // 1. Si public/card_redesign es un enlace simbólico o junction previa, eliminarlo
  if (fs.existsSync(publicCardRedesign)) {
    try {
      const stat = fs.lstatSync(publicCardRedesign);
      if (stat.isSymbolicLink()) {
        fs.unlinkSync(publicCardRedesign);
        console.log('[assets] Se eliminó la junction/symlink previa en public/card_redesign.');
      }
    } catch (e) {
      console.warn('[assets] Aviso al verificar junction/symlink:', e.message);
    }
  }

  // 2. Crear directorios reales de destino
  fs.mkdirSync(destVisualsDir, { recursive: true });
  fs.mkdirSync(destBackDir, { recursive: true });

  // 3. Limpiar archivos no deseados en public/card_redesign (ej. si existían carpetas de versiones anteriores)
  const allowedEntries = new Set(['generated_visuals', 'card_back']);
  for (const entry of fs.readdirSync(publicCardRedesign)) {
    if (!allowedEntries.has(entry)) {
      const entryPath = path.join(publicCardRedesign, entry);
      fs.rmSync(entryPath, { recursive: true, force: true });
      console.log(`[assets] Eliminado recurso innecesario de public: ${entry}`);
    }
  }

  let copiedCount = 0;
  let skippedCount = 0;

  // 4. Sincronizar las 49 ilustraciones oficiales (MTC01 - MTC49)
  for (let i = 1; i <= 49; i++) {
    const id = `MTC${String(i).padStart(2, '0')}`;
    const filename = `${id}_visual_final.png`;
    const srcFile = path.join(srcVisualsDir, filename);
    const destFile = path.join(destVisualsDir, filename);

    if (!fs.existsSync(srcFile)) {
      console.error(`[assets] ERROR: No se encontró la imagen fuente requerida: ${srcFile}`);
      continue;
    }

    let needsCopy = true;
    const srcStat = fs.statSync(srcFile);
    if (fs.existsSync(destFile)) {
      const destStat = fs.statSync(destFile);
      if (areFilesIdentical(srcFile, destFile, srcStat, destStat)) {
        needsCopy = false;
        skippedCount++;
      }
    }

    if (needsCopy) {
      fs.copyFileSync(srcFile, destFile);
      fs.utimesSync(destFile, srcStat.atime, srcStat.mtime);
      copiedCount++;
    }
  }

  // 5. Sincronizar el reverso oficial de las tarjetas
  const backFilename = 'mtc_card_back_art.png';
  const srcBackFile = path.join(srcBackDir, backFilename);
  const destBackFile = path.join(destBackDir, backFilename);

  if (fs.existsSync(srcBackFile)) {
    let needsCopy = true;
    const srcStat = fs.statSync(srcBackFile);
    if (fs.existsSync(destBackFile)) {
      const destStat = fs.statSync(destBackFile);
      if (areFilesIdentical(srcBackFile, destBackFile, srcStat, destStat)) {
        needsCopy = false;
        skippedCount++;
      }
    }
    if (needsCopy) {
      fs.copyFileSync(srcBackFile, destBackFile);
      fs.utimesSync(destBackFile, srcStat.atime, srcStat.mtime);
      copiedCount++;
    }
  } else {
    console.error(`[assets] ERROR: No se encontró el reverso de tarjeta: ${srcBackFile}`);
  }

  console.log(`[assets] Sincronización completa: 50 imágenes verificadas (${copiedCount} copiadas, ${skippedCount} actualizadas).`);
}

// Ejecutar si se invoca directamente desde CLI
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  syncPublicAssets();
}
