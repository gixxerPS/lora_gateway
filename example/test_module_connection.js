// index.js
const { SerialPort } = require('serialport');

const hex = b => [...b].map(x=>x.toString(16).padStart(2,'0')).join(' ');
const hexByte = b   => '0x' + Number(b).toString(16).padStart(2,'0');

async function tryBaud(baudRate){
  return new Promise(res=>{
    const port = new SerialPort({ path:'/dev/ttyAMA0', baudRate, autoOpen:true });
    //const port = new SerialPort({ path:'/dev/serial0', baudRate, autoOpen:true });
    let got = false;

    port.on('open', ()=>{
      console.log('open @', baudRate);
      // Read Parameters (E22/E220): 0xC1 0x00 0x09 – nur im Konfig-Modus
      port.write(Buffer.from([0xC1,0x00,0x09]));
      setTimeout(()=>{ if(!got){ port.close(()=>res(false)); } }, 800);
    });

    port.on('data', d=>{
      got = true;
      console.log('RX', hex(d));
      console.log('REG00=', hexByte(d[3]), '(ADDH)');
      console.log('REG01=', hexByte(d[4]), '(ADDL)');
      console.log('REG02=', hexByte(d[5]), '(NETID)');
      console.log('REG03=', hexByte(d[6]), '(REG0)');
      console.log('REG04=', hexByte(d[7]), '(REG1)');
      console.log('REG05=', hexByte(d[8]), '(REG2)');
      console.log('REG06=', hexByte(d[9]), '(REG3)');
      console.log('REG07=', hexByte(d[10]), '(CRYPT_H)');
      console.log('REG08=', hexByte(d[11]), '(CRYPT_L)');
      port.close(()=>res(true));
    });

    port.on('error', e=>{ console.error(e.message); res(false); });
  });
}

(async()=>{
  if(await tryBaud(9600)) return;
  if(await tryBaud(115200)) return;
  console.log('keine Antwort – prüfe M0/M1, Reboot nach Jumperwechsel, und dass /dev/serial0 aktiv ist');
})();

