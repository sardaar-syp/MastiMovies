import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  // We're in the browser and MetaMask is running
  window.ethereum.request({ method: 'eth_requestAccounts' });
  web3 = new Web3(window.ethereum);
} else {
  // We're on the server OR the user is not running MetaMask
  const provider = new Web3.providers.HttpProvider(
    process.env.REACT_APP_BLOCKCHAIN_PROVIDER || 'http://localhost:7545'
  );
  web3 = new Web3(provider);
}

export default web3;