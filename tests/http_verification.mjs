import http from 'node:http';
import assert from 'node:assert';

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      resolve({ statusCode: res.statusCode, contentType: res.headers['content-type'] });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing HTTP Endpoints on Preview Server (http://localhost:4173)...');

  // 1. Root index
  const root = await checkUrl('http://localhost:4173/');
  console.log(`- GET / : ${root.statusCode} (${root.contentType})`);
  assert.strictEqual(root.statusCode, 200);

  // 2. Sample Card Image MTC01
  const img1 = await checkUrl('http://localhost:4173/card_redesign/generated_visuals/MTC01_visual_final.png');
  console.log(`- GET /card_redesign/generated_visuals/MTC01_visual_final.png : ${img1.statusCode} (${img1.contentType})`);
  assert.strictEqual(img1.statusCode, 200);

  // 3. Sample Card Image MTC49
  const img49 = await checkUrl('http://localhost:4173/card_redesign/generated_visuals/MTC49_visual_final.png');
  console.log(`- GET /card_redesign/generated_visuals/MTC49_visual_final.png : ${img49.statusCode} (${img49.contentType})`);
  assert.strictEqual(img49.statusCode, 200);

  // 4. Card back art
  const cardBack = await checkUrl('http://localhost:4173/card_redesign/card_back/mtc_card_back_art.png');
  console.log(`- GET /card_redesign/card_back/mtc_card_back_art.png : ${cardBack.statusCode} (${cardBack.contentType})`);
  assert.strictEqual(cardBack.statusCode, 200);

  console.log('✓ All HTTP asset and root endpoints returned 200 OK!');
}

run().catch(err => {
  console.error('HTTP Verification Failed:', err);
  process.exit(1);
});
