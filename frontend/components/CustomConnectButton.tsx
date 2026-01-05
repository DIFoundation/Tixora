"use client"

import { useConnection } from 'wagmi';
import { Button } from './ui/button';
import { useAppKit } from '@reown/appkit/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function CustomConnectButton() {
  const { isConnected, address } = useConnection();
  const { open } = useAppKit();
  const [isLoading, setIsLoading] = useState(false);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  async function handleConnectWallet() {
    try {
      setIsLoading(true);
      if (!isConnected) {
        open({ view: "Connect" });
      } else {
        open({ view: "Account" });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // If wallet is connected, show address
  if (isConnected && address) {
    return (
      <Button
        onClick={handleConnectWallet}
        variant="secondary"
        className="w-full md:w-auto bg-linear-[#51a2ff] hover:from-[#51a2ff] hover:to-[#1c398e] text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          shortAddress
        )}
      </Button>
    );
  }

  // If wallet is not connected, show connect button
  return (
    <Button
      onClick={handleConnectWallet}
      variant="secondary"
      className="w-full md:w-auto bg-linear-[#51a2ff] hover:from-[#51a2ff] hover:to-[#1c398e] text-white"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </Button>
  );
}