import { ethers } from 'ethers';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

const tokenAbi = [
  "function transfer(address to, uint amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint)"
];

async function sendMaxToken() {
  const network = config.networks['yourNetworkKey']; // Ganti dengan kunci jaringan yang sesuai
  const provider = new ethers.JsonRpcProvider(network.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  // Alamat kontrak token ERC-20 (sesuaikan dengan token yang Anda gunakan)
  const tokenContractAddress = network.tokenContractAddress; // Ganti dengan alamat kontrak token Anda
  const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, wallet);

  // Mendapatkan saldo token maksimum
  const balance = await tokenContract.balanceOf(wallet.address);
  console.log(`Saldo token saat ini: ${ethers.formatUnits(balance, 18)} TOKEN`);

  // Alamat tujuan (sesuaikan dengan alamat yang diinginkan)
  const recipientAddress = '0xYourRecipientAddress'; // Ganti dengan alamat tujuan Anda

  // Mendapatkan harga gas secara otomatis
  const gasPrice = await provider.getGasPrice();

  // Membuat transaksi
  const tx = {
    to: tokenContractAddress,
    data: tokenContract.interface.encodeFunctionData('transfer', [recipientAddress, balance]),
    gasLimit: ethers.utils.hexlify(100000), // Sesuaikan gas limit jika diperlukan
    gasPrice: gasPrice // Menggunakan harga gas dari provider
  };

  try {
    // Mengirim transaksi
    const txResponse = await wallet.sendTransaction(tx);
    console.log(`Transaksi berhasil! Hash: ${txResponse.hash}`);

    // Menunggu konfirmasi transaksi
    await txResponse.wait();
    console.log('Transaksi telah dikonfirmasi.');
  } catch (error) {
    console.error('Kesalahan saat mengirim token:', error.message);
  }
}

sendMaxToken();
