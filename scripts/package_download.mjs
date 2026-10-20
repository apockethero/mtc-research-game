// ============================================================================
// MTC Research Game - Generador del Paquete Descargable Portable (ZIP)
// Empaqueta el juego compilado con servidor HTTP local en PowerShell
// Sin dependencias de Node.js en la máquina del participante
// ============================================================================

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { syncPublicAssets } from './sync_public_assets.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const distDir = path.join(projectRoot, 'dist');
const releaseDir = path.join(projectRoot, 'release');
const stagingFolderName = 'MTC_Research_Game';
const stagingDir = path.join(releaseDir, stagingFolderName);
const zipFileName = 'MTC_Research_Game_Windows_Portable.zip';
const zipFilePath = path.join(releaseDir, zipFileName);
const templatesDir = path.join(projectRoot, 'scripts', 'templates_dist');

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.name === '.gitkeep') continue;

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function buildDownloadPackage() {
  console.log('========================================================================');
  console.log('  GENERANDO PAQUETE DESCARGABLE: MTC Research Game (ZIP Portable)');
  console.log('========================================================================');

  // 1. Sincronizar assets públicos requeridos (50 PNGs)
  console.log('\n[Paso 1/5] Sincronizando assets de tarjetas...');
  syncPublicAssets();

  // 2. Compilar aplicación con base relativa './' para ejecución local
  console.log('\n[Paso 2/5] Compilando aplicación de producción (Vite + TypeScript)...');
  // Asegurar que no esté activada la bandera de GitHub Pages para empaquetado local
  delete process.env.GITHUB_PAGES;
  delete process.env.VITE_BASE_PATH;
  execSync('npm run build', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, GITHUB_PAGES: 'false', VITE_BASE_PATH: './' }
  });

  if (!fs.existsSync(distDir)) {
    throw new Error('El directorio dist/ no fue generado tras la compilación.');
  }

  // 3. Preparar área de preparación (staging)
  console.log('\n[Paso 3/5] Estructurando carpeta de distribución portable...');
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  // Copiar archivos de producción de dist/
  copyDirRecursive(distDir, stagingDir);

  // Copiar lanzadores y documentación para el participante
  fs.copyFileSync(path.join(templatesDir, 'INICIAR_JUEGO.bat'), path.join(stagingDir, 'INICIAR_JUEGO.bat'));
  fs.copyFileSync(path.join(templatesDir, 'server.ps1'), path.join(stagingDir, 'server.ps1'));
  fs.copyFileSync(path.join(templatesDir, 'LEEME.txt'), path.join(stagingDir, 'LEEME.txt'));

  // 4. Auditoría estricta de seguridad previa a la compresión
  console.log('\n[Paso 4/5] Auditando archivos empaquetados contra fugas de credenciales...');
  function auditFolder(dir) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        auditFolder(full);
      } else {
        const lower = item.name.toLowerCase();
        if (
          lower.startsWith('.env') ||
          lower.endsWith('.key') ||
          lower.endsWith('.pem') ||
          lower === 'credentials.json' ||
          lower.includes('service_role')
        ) {
          throw new Error(`CRÍTICO: Intento de incluir archivo sensible en el ZIP: ${item.name}`);
        }
      }
    }
  }
  auditFolder(stagingDir);
  console.log('✓ Auditoría superada: 0 credenciales ni archivos de entorno en el paquete.');

  // Contar imágenes de tarjetas
  const visualsDir = path.join(stagingDir, 'card_redesign', 'generated_visuals');
  const backFile = path.join(stagingDir, 'card_redesign', 'card_back', 'mtc_card_back_art.png');
  const visualsCount = fs.existsSync(visualsDir) ? fs.readdirSync(visualsDir).filter(f => f.endsWith('.png')).length : 0;
  const backExists = fs.existsSync(backFile);

  if (visualsCount !== 49 || !backExists) {
    throw new Error(`Faltan imágenes de cartas: visuales=${visualsCount}/49, reverso=${backExists}`);
  }
  console.log(`✓ Integridad de imágenes verificada: 49 visuales + 1 reverso presentes.`);

  // 5. Comprimir a formato ZIP estándar
  console.log('\n[Paso 5/5] Creando archivo comprimido ZIP...');
  if (fs.existsSync(zipFilePath)) {
    fs.rmSync(zipFilePath, { force: true });
  }

  const isWindows = process.platform === 'win32';
  if (isWindows) {
    // Usar PowerShell Compress-Archive en Windows
    const psCmd = `Compress-Archive -Path "${stagingDir}" -DestinationPath "${zipFilePath}" -Force`;
    execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'inherit' });
  } else {
    // Usar zip en Linux/macOS
    execSync(`cd "${releaseDir}" && zip -r "${zipFileName}" "${stagingFolderName}"`, { stdio: 'inherit' });
  }

  const zipStat = fs.statSync(zipFilePath);
  const zipSizeMb = (zipStat.size / (1024 * 1024)).toFixed(2);

  // Limpiar directorio temporal de staging para no duplicar espacio en disco
  fs.rmSync(stagingDir, { recursive: true, force: true });

  console.log('\n========================================================================');
  console.log('  PAQUETE DESCARGABLE GENERADO EXITOSAMENTE');
  console.log('========================================================================');
  console.log(`  Archivo ZIP:    ${zipFilePath}`);
  console.log(`  Tamaño final:   ${zipSizeMb} MB`);
  console.log('  Contenido:      Juego compilado, 50 imágenes PNG, servidor 127.0.0.1,');
  console.log('                  INICIAR_JUEGO.bat y LEEME.txt.');
  console.log('========================================================================\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  buildDownloadPackage();
}
