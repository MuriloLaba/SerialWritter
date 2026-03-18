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

function formatNumber(num) {
  const number = parseInt(num);
  if (isNaN(number)) {
    return null;
  }
  return number.toString().padStart(2, '0');
}

function sendCommand(number) {
  const formattedNumber = formatNumber(number);
  if (formattedNumber === null) {
    console.log('Número inválido! Digite apenas números.');
    return;
  }
  
  const command = `@${formattedNumber}\r\n`;
  
  port.write(command, (err) => {
    if (err) {
      console.log('Erro ao enviar comando:', err.message);
    } else {
      // console.log(`Enviado: ${command}`);
    }
  });
}

function promptUser() {
  rl.question('Digite um número (ou "exit" para sair): ', (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('👋 Encerrando programa...');
      port.close();
      rl.close();
      process.exit(0);
    }
    
    sendCommand(input.trim());
    promptUser(); 
  });
}

port.on('open', () => {
  console.log(`🔌 Conectado à porta serial: ${SERIAL_PORT}`);
  console.log(`⚙️  Configuração: ${BAUD_RATE} baud, 8N1`);
  console.log('📝 Digite números e pressione Enter para enviá-los');
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
  port.close();
  rl.close();
  process.exit(0);
});

console.log('🚀 Iniciando programa de console serial...');
console.log(`🔍 Tentando conectar na porta: ${SERIAL_PORT}`);