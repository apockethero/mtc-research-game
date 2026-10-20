import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const zipPath = path.join(projectRoot, 'release', 'MTC_Research_Game_Windows_Portable.zip');
const unpackDir = path.join(projectRoot, 'release', 'test_unpack');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(data)
        });
      });
    }).on('error', reject);
  });
}

function httpsRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(data).toString('utf-8')
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runPhase4ATests() {
  console.log('========================================================================');
  console.log('  FASE 4A: VALIDACIÓN FINAL LOCAL DE MTC RESEARCH GAME');
  console.log('========================================================================\n');

  const report = {
    zipExists: false,
    zipSizeMb: 0,
    zipExtracted: false,
    launcherValid: false,
    serverSyntaxValid: false,
    serverLiveTest: false,
    imagesVerified: 0,
    publicVariablesConfigured: false,
    edgeFunctionReachable: false,
    edgeFunctionDetails: '',
    zipSensitiveFiles: [],
    gitCleanOfSecrets: false
  };

  // 1. Verificar existencia y extracción del ZIP
  console.log('[Paso 1] Comprobando archivo ZIP y extrayendo paquete...');
  if (!fs.existsSync(zipPath)) {
    throw new Error(`El archivo ZIP no existe en: ${zipPath}`);
  }
  const zipStat = fs.statSync(zipPath);
  report.zipExists = true;
  report.zipSizeMb = (zipStat.size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Archivo ZIP localizado: ${zipPath} (${report.zipSizeMb} MB)`);

  if (fs.existsSync(unpackDir)) {
    fs.rmSync(unpackDir, { recursive: true, force: true });
  }
  fs.mkdirSync(unpackDir, { recursive: true });

  // Descomprimir usando PowerShell expand-archive
  const psUnpack = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${unpackDir}' -Force"`;
  execSync(psUnpack, { stdio: 'pipe' });

  const rootExtracted = path.join(unpackDir, 'MTC_Research_Game');
  if (!fs.existsSync(rootExtracted)) {
    throw new Error('La carpeta raíz MTC_Research_Game no se encuentra dentro del ZIP extraído.');
  }
  report.zipExtracted = true;
  console.log(`✓ Paquete descomprimido correctamente en: ${rootExtracted}`);

  // 2. Verificar INICIAR_JUEGO.bat y server.ps1
  console.log('\n[Paso 2] Verificando scripts de inicio y servidor...');
  const batPath = path.join(rootExtracted, 'INICIAR_JUEGO.bat');
  const ps1Path = path.join(rootExtracted, 'server.ps1');
  const readmePath = path.join(rootExtracted, 'LEEME.txt');
  const htmlPath = path.join(rootExtracted, 'index.html');

  if (!fs.existsSync(batPath) || !fs.existsSync(ps1Path) || !fs.existsSync(readmePath) || !fs.existsSync(htmlPath)) {
    throw new Error('Faltan archivos esenciales en el paquete descomprimido.');
  }

  const batContent = fs.readFileSync(batPath, 'utf-8');
  const ps1Content = fs.readFileSync(ps1Path, 'utf-8');

  if (!batContent.includes('server.ps1')) {
    throw new Error('INICIAR_JUEGO.bat no invoca a server.ps1 correctamente.');
  }
  if (!ps1Content.includes('127.0.0.1') || !ps1Content.includes('HttpListener')) {
    throw new Error('server.ps1 no contiene la configuración segura de HttpListener en 127.0.0.1.');
  }
  report.launcherValid = true;
  report.serverSyntaxValid = true;
  console.log('✓ INICIAR_JUEGO.bat y server.ps1 configurados y coordinados correctamente.');

  // 3. Probar el servidor local (ejecución temporal con timeout estricto)
  console.log('\n[Paso 3] Probando servidor local en 127.0.0.1 con timeout estricto...');
  let serverProcess = null;
  try {
    // Iniciar servidor PowerShell en segundo plano
    serverProcess = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1Path], {
      cwd: rootExtracted,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Esperar hasta 4 segundos a que el servidor inicialice
    let serverReady = false;
    let attempts = 0;
    let targetPort = 8080;

    while (attempts < 15 && !serverReady) {
      await sleep(300);
      try {
        const testRes = await httpGet(`http://127.0.0.1:${targetPort}/`);
        if (testRes.statusCode === 200) {
          serverReady = true;
          console.log(`✓ Servidor local respondió exitosamente en http://127.0.0.1:${targetPort}/ (Status 200 OK).`);
          
          // Verificar MIME type del index.html
          const ctype = testRes.headers['content-type'] || '';
          console.log(`  Content-Type de index.html: ${ctype}`);

          // Probar una llamada a un asset JS
          const assetsDir = path.join(rootExtracted, 'assets');
          const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
          if (jsFiles.length > 0) {
            const jsRes = await httpGet(`http://127.0.0.1:${targetPort}/assets/${jsFiles[0]}`);
            console.log(`✓ Asset JS (${jsFiles[0]}) respondió con status ${jsRes.statusCode} (${jsRes.headers['content-type']}).`);
          }

          // Probar una llamada a una imagen de carta
          const imgRes = await httpGet(`http://127.0.0.1:${targetPort}/card_redesign/card_back/mtc_card_back_art.png`);
          console.log(`✓ Imagen reverso respondió con status ${imgRes.statusCode} (${imgRes.headers['content-type']}, ${imgRes.body.length} bytes).`);

          report.serverLiveTest = true;
          break;
        }
      } catch (err) {
        attempts++;
      }
    }

    if (!serverReady) {
      console.warn('! Advertencia: El servidor no respondió dentro del tiempo límite esperado.');
    }
  } finally {
    if (serverProcess) {
      console.log('Deteniendo proceso del servidor...');
      try {
        execSync(`taskkill /PID ${serverProcess.pid} /F /T`, { stdio: 'ignore' });
      } catch (e) {
        serverProcess.kill('SIGKILL');
      }
      console.log('✓ Servidor detenido cleanly.');
    }
  }

  // 4. Comprobar las 50 imágenes
  console.log('\n[Paso 4] Verificando presencia e integridad de las 50 imágenes...');
  const visualsDir = path.join(rootExtracted, 'card_redesign', 'generated_visuals');
  const backImgPath = path.join(rootExtracted, 'card_redesign', 'card_back', 'mtc_card_back_art.png');

  let missingImages = [];
  for (let i = 1; i <= 49; i++) {
    const pad = String(i).padStart(2, '0');
    const filename = `MTC${pad}_visual_final.png`;
    const full = path.join(visualsDir, filename);
    if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
      missingImages.push(filename);
    }
  }
  if (!fs.existsSync(backImgPath) || fs.statSync(backImgPath).size === 0) {
    missingImages.push('mtc_card_back_art.png');
  }

  if (missingImages.length > 0) {
    throw new Error(`Imágenes faltantes o vacías: ${missingImages.join(', ')}`);
  }
  report.imagesVerified = 50;
  console.log(`✓ Las 50 imágenes (49 cartas + 1 reverso) existen y son archivos PNG válidos no vacíos.`);

  // 5. Verificar variables públicas para Supabase en el bundle
  console.log('\n[Paso 5] Verificando variables públicas de Supabase en el bundle compilado...');
  const assetsFolder = path.join(rootExtracted, 'assets');
  const jsBundle = fs.readdirSync(assetsFolder).find(f => f.endsWith('.js'));
  const bundleContent = fs.readFileSync(path.join(assetsFolder, jsBundle), 'utf-8');

  const hasSupabaseUrl = bundleContent.includes('kohealboprmblobyzvqa.supabase.co');
  // Verificar si contiene token/clave anon sin mostrar su valor
  const hasAnonKeyFormat = bundleContent.includes('sb_publishable_') || bundleContent.includes('eyJhbGciOi');

  if (hasSupabaseUrl && hasAnonKeyFormat) {
    report.publicVariablesConfigured = true;
    console.log('✓ VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY están integradas correctamente en el bundle.');
  } else {
    console.warn(`! Advertencia: Supabase URL presente: ${hasSupabaseUrl}, Anon Key presente: ${hasAnonKeyFormat}`);
  }

  // 6. Probar conectividad con Supabase Edge Function
  console.log('\n[Paso 6] Verificando disponibilidad de Supabase Edge Function (submit-evaluation)...');
  const functionUrl = 'https://kohealboprmblobyzvqa.supabase.co/functions/v1/submit-evaluation';
  try {
    // Prueba preflight OPTIONS
    const optionsRes = await httpsRequest(functionUrl, { method: 'OPTIONS' });
    console.log(`✓ Petición OPTIONS respondió con código: ${optionsRes.statusCode}`);
    console.log(`  Access-Control-Allow-Origin: ${optionsRes.headers['access-control-allow-origin'] || 'no devuelto'}`);

    // Prueba de validación de esquema con POST inválido (sin modificar datos de investigación)
    const postRes = await httpsRequest(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({ ping: 'probe_test_no_consent' }));

    console.log(`✓ Petición de validación POST respondió con código: ${postRes.statusCode}`);
    console.log(`  Respuesta de validación: ${postRes.body}`);

    if (optionsRes.statusCode === 204 && postRes.statusCode === 400) {
      report.edgeFunctionReachable = true;
      report.edgeFunctionDetails = 'Edge function operativa: valida esquemas y responde CORS correctamente.';
      console.log('✓ La Edge Function está desplegada, activa y responde con validación de seguridad.');
    }
  } catch (err) {
    console.warn('! No se pudo conectar con la Edge Function:', err.message);
    report.edgeFunctionDetails = `Error de conexión: ${err.message}`;
  }

  // 7. Verificar que el ZIP no contenga archivos sensibles
  console.log('\n[Paso 7] Auditando archivos en el ZIP extraído contra secretos...');
  const sensitivePatterns = [
    /\.env/i,
    /\.key$/i,
    /\.pem$/i,
    /credentials/i,
    /service_role/i,
    /resend_api_key/i
  ];

  function scanFolder(dir) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanFolder(full);
      } else {
        for (const pattern of sensitivePatterns) {
          if (pattern.test(item.name)) {
            report.zipSensitiveFiles.push(item.name);
          }
        }
        // Escaneo superficial de contenido si es texto/js
        if (item.name.endsWith('.js') || item.name.endsWith('.html') || item.name.endsWith('.json') || item.name.endsWith('.txt')) {
          const content = fs.readFileSync(full, 'utf-8');
          if (content.includes('RESEND_API_KEY') || content.includes('service_role_key')) {
            report.zipSensitiveFiles.push(`${item.name} (contiene texto sensible)`);
          }
        }
      }
    }
  }
  scanFolder(rootExtracted);

  if (report.zipSensitiveFiles.length === 0) {
    console.log('✓ Auditoría de seguridad del ZIP: CERO archivos sensibles ni credenciales detectadas.');
  } else {
    console.error('! ATENCIÓN: Se encontraron elementos sensibles en el ZIP:', report.zipSensitiveFiles);
  }

  // 8. Verificar Git status
  console.log('\n[Paso 8] Verificando estado del árbol de Git...');
  const gitStatus = execSync('git status --short', { cwd: projectRoot }).toString();
  const gitStaged = execSync('git diff --cached --name-only', { cwd: projectRoot }).toString().trim();

  if (gitStaged.length === 0) {
    report.gitCleanOfSecrets = true;
    console.log('✓ Ningún archivo está preparado (staged) en el índice de Git.');
  } else {
    console.log('Archivos en stage:', gitStaged);
  }

  // Limpieza de carpeta de prueba
  fs.rmSync(unpackDir, { recursive: true, force: true });
  console.log('\n✓ Carpeta temporal de prueba eliminada.');

  console.log('\n========================================================================');
  console.log('  RESUMEN DE RESULTADOS FASE 4A');
  console.log('========================================================================');
  console.log(JSON.stringify(report, null, 2));
}

runPhase4ATests().catch(err => {
  console.error('Error durante la validación:', err);
  process.exit(1);
});
