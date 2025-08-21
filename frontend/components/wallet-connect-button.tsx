"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { LogOut } from 'lucide-react'

interface WalletConnectButtonProps {
  className?: string
}

export function WalletConnectButton({ className }: WalletConnectButtonProps = {}) {
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const { disconnect } = useDisconnect()

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={`px-6 py-3 bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200 border border-[var(--color-neon-purple)]/30 flex items-center justify-center ${className || ''}`}
                  >
                    Connect Wallet
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-6 py-3 bg-red-500/80 text-white rounded-lg font-semibold hover:bg-red-500 transition-all duration-200 border border-red-400/30"
                  >
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-dark-navy)]/80 border border-[var(--color-neon-purple)]/30 text-white rounded-lg hover:bg-[var(--color-dark-navy)] hover:opacity-90 transition-all duration-200"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-dark-navy)]/80 border border-[var(--color-neon-blue)]/30 text-white rounded-lg hover:bg-[var(--color-dark-navy)] hover:opacity-90 transition-all duration-200"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{account.displayName}</span>
                      {balance && (
                        <span className="text-xs text-slate-300">
                          {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={handleDisconnect}
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/80 border border-red-400/30 text-white rounded-lg hover:bg-red-500 hover:opacity-90 transition-all duration-200"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
