const fs = require('fs');
const https = require('https');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const maps = [
  { url: 'https://archives.bulbagarden.net/media/upload/2/25/Kanto_FRLG.png', file: 'map_kanto.png' },
  { url: 'https://archives.bulbagarden.net/media/upload/6/64/Johto_HGSS.png', file: 'map_johto.png' },
  { url: 'https://archives.bulbagarden.net/media/upload/8/85/Hoenn_Emerald.png', file: 'map_hoenn.png' },
  { url: 'https://archives.bulbagarden.net/media/upload/0/08/Sinnoh_Pt_map.png', file: 'map_sinnoh.png' },
  { url: 'https://archives.bulbagarden.net/media/upload/f/fc/Unova_B2W2_map.png', file: 'map_unova.png' }
];

async function main() {
  for (const m of maps) {
    const dest = path.join(__dirname, 'public', 'images', 'maps', m.file);
    try {
      await download(m.url, dest);
      console.log('Downloaded', m.file);
    } catch (e) {
      console.error('Failed', m.file, e.message);
    }
  }
}
main();
