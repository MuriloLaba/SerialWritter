const { SerialPort } = require('serialport');
const readline = require('readline');

const SERIAL_PORT = 'COM1';
const BAUD_RATE = 9600;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const port = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUD_RATE,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
});

let isRunning = false;
let totalNumbers = 0;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatNumber(num) {
  return num.toString().padStart(2, '0');
}

function sendCommand(number) {
  const command = `@${formatNumber(number)}\r\n`;
  port.write(command, (err) => {
    if (err) {
      console.log('Erro ao enviar comando:', err.message);
    } else {
      console.log(`📤 Enviado: ${command.trim()}`);
    }
  });
}

function sendBatch() {
  if (!isRunning) return;

  const numbers = shuffle(Array.from({ length: totalNumbers }, (_, i) => i + 1));
  const totalTime = 1000; // 1 segundo para enviar todos os números

  console.log(`\n🔄 Iniciando envio de ${totalNumbers} números em ordem aleatória...`);

  numbers.forEach((num, index) => {
    const delay = randomInt(0, totalTime - 1);
    setTimeout(() => {
      if (isRunning) sendCommand(num);
    }, delay);
  });

  const waitTime = randomInt(15000, 20000);
  console.log(`⏳ Próximo envio em ${(waitTime / 1000).toFixed(1)}s`);
  setTimeout(() => {
    if (isRunning) sendBatch();
  }, totalTime + waitTime);
}

function promptUser() {
  rl.question('Quantos números deseja enviar? (ex: 15): ', (input) => {
    const n = parseInt(input.trim());
    if (isNaN(n) || n <= 0) {
      console.log('❌ Valor inválido! Digite um número inteiro positivo.');
      return promptUser();
    }

    totalNumbers = n;
    isRunning = true;
    console.log(`\n✅ Enviando números de 1 a ${n} em ordem aleatória.`);
    console.log('   Pressione Ctrl+C para parar.\n');
    sendBatch();
  });
}

port.on('open', () => {
  console.log(`🔌 Conectado à porta serial: ${SERIAL_PORT}`);
  console.log(`⚙️  Configuração: ${BAUD_RATE} baud, 8N1`);
  promptUser();
});

port.on('error', (err) => {
  console.log('Erro na porta serial:', err.message);
  process.exit(1);
});

port.on('close', () => {
  console.log('🔌 Conexão serial fechada');
});

port.on('data', (data) => {
  console.log('📥 Recebido:', data.toString());
});

process.on('SIGINT', () => {
  console.log('\n👋 Encerrando programa...');
  isRunning = false;
  port.close();
  rl.close();
  process.exit(0);
});

console.log('🚀 Iniciando enviador automático serial...');
console.log(`🔍 Tentando conectar na porta: ${SERIAL_PORT}`);
