import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import readline from 'readline';

// Membaca file konfigurasi
const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function sendEth() {
  const network = config.networks['yourNetworkKey']; // Ganti dengan kunci jaringan yang sesuai
  const provider = new ethers.JsonRpcProvider(network.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  const recipientAddress = await getInput("Masukkan alamat tujuan ETH: ");
  const balance = await provider.getBalance(wallet.address);
  console.log(`Saldo ETH saat ini: ${ethers.formatUnits(balance, 18)} ETH`);

  const tx = {
    to: recipientAddress,
    value: balance
  };

  try {
    const txResponse = await wallet.sendTransaction(tx);
    console.log(`Transaksi ETH berhasil! Hash: ${txResponse.hash}`);
    await txResponse.wait();
    console.log('Transaksi telah dikonfirmasi.');
  } catch (error) {
    console.error('Kesalahan saat mengirim ETH:', error.message);
  }
}

async function sendToken() {
  const network = config.networks['yourNetworkKey']; // Ganti dengan kunci jaringan yang sesuai
  const provider = new ethers.JsonRpcProvider(network.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  const tokenAbi = [
    "function transfer(address to, uint amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint)"
  ];

  const tokenContractAddress = network.tokenContractAddress; // Ganti dengan alamat kontrak token Anda
  const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, wallet);

  const recipientAddress = await getInput("Masukkan alamat tujuan token: ");
  const balance = await tokenContract.balanceOf(wallet.address);
  console.log(`Saldo token saat ini: ${ethers.formatUnits(balance, 18)} TOKEN`);

  const amount = ethers.parseUnits(await getInput('Masukkan jumlah token yang ingin dikirim: '), 18);

  const tx = {
    to: tokenContractAddress,
    data: tokenContract.interface.encodeFunctionData('transfer', [recipientAddress, amount]),
    gasLimit: ethers.utils.hexlify(100000), // Sesuaikan gas limit jika diperlukan
    gasPrice: await provider.getGasPrice()
  };

  try {
    const txResponse = await wallet.sendTransaction(tx);
    console.log(`Transaksi token berhasil! Hash: ${txResponse.hash}`);
    await txResponse.wait();
    console.log('Transaksi telah dikonfirmasi.');
  } catch (error) {
    console.error('Kesalahan saat mengirim token:', error.message);
  }
}

async function main() {
  console.log("Pilih jenis transaksi:");
  console.log("1: Kirim ETH");
  console.log("2: Kirim Token ERC-20");

  const choice = await getInput("Pilih (1/2): ");

  if (choice === '1') {
    await sendEth();
  } else if (choice === '2') {
    await sendToken();
  } else {
    console.error("Pilihan tidak valid.");
  }

  rl.close();
}

main();
