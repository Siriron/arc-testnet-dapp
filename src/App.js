import React, { useState } from 'react';
import { Wallet, Send, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const ARC_TESTNET = {
    chainId: '0x4CE7B2',
    chainName: 'Arc Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
    rpcUrls: ['https://arc-testnet.drpc.org'],
    blockExplorerUrls: ['https://arc-testnet.explorer.circle.com']
  };

  const connectWallet = async () => {
    setError('');
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask or another Web3 wallet');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARC_TESTNET.chainId }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARC_TESTNET]
          });
        } else {
          throw switchError;
        }
      }
      setAccount(accounts[0]);
      fetchBalance(accounts[0]);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const fetchBalance = async (address) => {
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const balanceInWei = parseInt(balanceHex, 16);
      const balanceInUSDC = (balanceInWei / 1000000).toFixed(2);
      setBalance(balanceInUSDC);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const sendUSDC = async () => {
    setError('');
    setTxHash('');
    setLoading(true);
    try {
      if (!recipient || !amount) {
        throw new Error('Please fill in all fields');
      }
      const amountInWei = Math.floor(parseFloat(amount) * 1000000);
      const hexAmount = '0x' + amountInWei.toString(16);
      const transactionParameters = {
        from: account,
        to: recipient,
        value: hexAmount,
        gas: '0x5208',
      };
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });
      setTxHash(hash);
      setRecipient('');
      setAmount('');
      setTimeout(() => fetchBalance(account), 3000);
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => {
    if (account) fetchBalance(account);
  };

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '1rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Arc Testnet dApp</h1>
              <p style={{ color: '#6b7280' }}>Send USDC on Circle's Arc Network</p>
            </div>
            <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '9999px' }}>
              <Wallet style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} />
            </div>
          </div>

          <div style={{ background: '#eef2ff', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Network:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#4f46e5' }}>Arc Testnet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Chain ID:</span>
              <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#6b7280' }}>5042002</span>
            </div>
          </div>

          {!account ? (
            <button onClick={connectWallet} style={{ width: '100%', background: '#4f46e5', color: 'white', fontWeight: '600', padding: '1rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Wallet style={{ width: '1.25rem', height: '1.25rem' }} />
              Connect Wallet
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Connected:</span>
                  <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#6b7280' }}>{shortenAddress(account)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Balance:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#4f46e5' }}>{balance} USDC</span>
                    <button onClick={refreshBalance} style={{ padding: '0.25rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <RefreshCw style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
                    </button>
                  </div>
                </div>
              </div>
              <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', background: '#eff6ff', color: '#1e40af', fontWeight: '500', padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
                Get Testnet USDC from Faucet
                <ExternalLink style={{ width: '1rem', height: '1rem' }} />
              </a>
            </div>
          )}
        </div>

        {account && (
          <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send style={{ width: '1.5rem', height: '1.5rem', color: '#4f46e5' }} />
              Send USDC
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Recipient Address</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Amount (USDC)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.000001" min="0" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none' }} />
              </div>
              <button onClick={sendUSDC} disabled={loading} style={{ width: '100%', background: loading ? '#9ca3af' : '#4f46e5', color: 'white', fontWeight: '600', padding: '1rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? (
                  <>
                    <RefreshCw style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                    Send USDC
                  </>
                )}
              </button>
            </div>
            {error && (
              <div style={{ marginTop: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444', flexShrink: 0, marginTop: '0.125rem' }} />
                <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{error}</p>
              </div>
            )}
            {txHash && (
              <div style={{ marginTop: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#166534', marginBottom: '0.5rem' }}>Transaction Successful!</p>
                <a href={`${ARC_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#4f46e5', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                  View on Explorer
                  <ExternalLink style={{ width: '1rem', height: '1rem' }} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
