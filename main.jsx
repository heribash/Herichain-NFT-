import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { inAppWallet, createWallet, walletConnect } from 'thirdweb/wallets';
import { appConfig } from '@/config';

export const client = createThirdwebClient({
  clientId: appConfig.thirdwebClientId,
});

const wallets = [
  inAppWallet({ client }),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  walletConnect(),
  createWallet('com.trustwallet.app'),
  createWallet('me.rainbow'),
  createWallet('app.phantom'),
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <ThirdwebProvider 
      activeChain={polygonAmoy}
      supportedWallets={wallets}
      client={client}
    >
      <Router>
        <App />
      </Router>
    </ThirdwebProvider>
  </>
);