let currentType   = 'url';
let currentWifiSec = 'WPA';
let qrInstance    = null;

function setType(type) {
  currentType = type;
  ['url','wifi','contact','text'].forEach(t => {
    document.getElementById('panel' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('hidden', t !== type);
  });
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.className = 'type-btn py-3 rounded-2xl text-xs font-semibold transition-all text-slate-400';
  });
  const active = document.getElementById('type' + type.charAt(0).toUpperCase() + type.slice(1));
  if (active) active.className = 'type-btn py-3 rounded-2xl text-xs font-semibold transition-all bg-violet-600 text-white';
}

function setWifiSec(sec) {
  currentWifiSec = sec;
  ['WPA','WEP',''].forEach(s => {
    const id = 'sec' + (s === '' ? 'None' : s);
    const btn = document.getElementById(id);
    if (btn) btn.className = `sec-btn flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${
      s === sec ? 'border-violet-500 bg-violet-600/30 ring-2 ring-violet-500' : 'border-white/20 bg-white/5'
    }`;
  });
}

function buildQRContent() {
  switch (currentType) {
    case 'url':
      return document.getElementById('inputUrl').value.trim() || 'https://example.com';

    case 'wifi': {
      const ssid = document.getElementById('wifiSsid').value.trim();
      const pass = document.getElementById('wifiPass').value;
      const sec  = currentWifiSec;
      if (!ssid) { alert('Enter the WiFi network name.'); return null; }
      return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
    }

    case 'contact': {
      const first = document.getElementById('contactFirst').value.trim();
      const last  = document.getElementById('contactLast').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const web   = document.getElementById('contactWeb').value.trim();
      if (!first && !last) { alert('Enter at least a name.'); return null; }
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${first} ${last}`.trim(),
        `N:${last};${first}`,
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        web   ? `URL:${web}`   : '',
        'END:VCARD'
      ].filter(Boolean).join('\n');
    }

    case 'text':
      return document.getElementById('inputText').value.trim() || 'Hello!';

    default:
      return '';
  }
}

function generateQR() {
  const content = buildQRContent();
  if (!content) return;

  const fg   = document.getElementById('colorFg').value;
  const bg   = document.getElementById('colorBg').value;
  const size = parseInt(document.getElementById('qrSize').value);

  const container = document.getElementById('qrCanvas');
  container.innerHTML = '';
  container.style.background = bg;

  qrInstance = new QRCode(container, {
    text:           content,
    width:          size,
    height:         size,
    colorDark:      fg,
    colorLight:     bg,
    correctLevel:   QRCode.CorrectLevel.H
  });

  document.getElementById('outputCard').classList.remove('hidden');
  document.getElementById('outputCard').scrollIntoView({ behavior: 'smooth' });
}

function getQRCanvas() {
  return document.querySelector('#qrCanvas canvas');
}

function downloadQR() {
  const canvas = getQRCanvas();
  if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'qrcode.png';
  a.click();
}

async function shareQR() {
  const canvas = getQRCanvas();
  if (!canvas) return;
  canvas.toBlob(async blob => {
    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: 'QR Code', files: [file] });
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qrcode.png';
      a.click();
    }
  }, 'image/png');
}

// Live preview on color/size change
['colorFg','colorBg','qrSize'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    if (document.getElementById('outputCard').classList.contains('hidden')) return;
    generateQR();
  });
});

// Init
setType('url');
setWifiSec('WPA');
