// make sure jumper are set correctly i.e. M0=short; M1=open

// write_config.js
const { SerialPort } = require('serialport');
const fs = require('fs');

const hexBuf  = buf => Array.from(buf).map(b=>b.toString(16).padStart(2,'0')).join(' ');
const hexByte = b   => '0x' + Number(b).toString(16).padStart(2,'0');

const PATH = '/dev/ttyAMA0';   // ggf. '/dev/ttyAMA10'
const BAUD = 9600;

const cfg   = JSON.parse(fs.readFileSync('setup.json','utf8'));
const addr  = (Number(cfg.addr)  & 0xFFFF) >>> 0;
const netid = (Number(cfg.netid) & 0xFF)   >>> 0;

const addrH = (addr >> 8) & 0xFF;
const addrL = addr & 0xFF;

// Beispiel-Payload: [ADDR_H, ADDR_L, NETID, ...]
// Passe die restlichen Bytes nach deinem Modulformat an.
const payload = [addrH, addrL, netid];

// Write-Parameters (Config-Mode nötig: M0=short, M1=open)
const cmd = Buffer.from([0xC0, 0x00, 0x03, ...payload]);

console.log('set address = ', hexByte(addr));
console.log('set netid = ', hexByte(netid));
console.log('Sende:', hexBuf(cmd));

const port = new SerialPort({ path: PATH, baudRate: BAUD });

let timer;
port.on('open', () => {
  port.write(cmd);
  // Timeout-Fail nach 1 s
  timer = setTimeout(() => {
    console.error('Timeout: keine Antwort');
    process.exitCode = 1;
    port.close();
  }, 1000);
});

port.on('data', d => {
  clearTimeout(timer);
  console.log('Antwort:', hexBuf(d));

  // Fehlerfall: exakt 0xFF 0xFF 0xFF am Anfang → Format falsch
  if (d.length >= 3 && d[0] === 0xFF && d[1] === 0xFF && d[2] === 0xFF) {
    console.error('Fehler: Antwort 0xFF 0xFF 0xFF → falsches Befehlsformat/Length.');
    process.exitCode = 2;
  } else {
    // Beispiel-Auswertung: erste Bytes anzeigen
    console.log('Status[0]=', hexByte(d[0]), 'Status[1]=', hexByte(d[1]), 'Status[2]=', hexByte(d[2]));
  }

  port.close();
});

port.on('error', e => { console.error(e.message); process.exitCode = 1; });

