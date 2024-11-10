'use client'

import { PropsWithChildren } from 'react'
import { PetraWallet } from 'petra-plugin-wallet-adapter'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design'
import React from 'react'
// import {
// Aptos,
// AptosConfig,
// Network,
// APTOS_COIN,
// AccountAddressInput,
// } from '@aptos-labs/ts-sdk'
import { Network } from 'aptos'

const wallets = [new PetraWallet()]
export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <body className="grow">
            <AptosWalletAdapterProvider
                plugins={wallets}
                // autoConnect={}
                dappConfig={{
                    network: Network.TESTNET,
                    aptosApiKey: process.env.NEXT_PUBLIC_APTOS_API_KEY,
                    // aptosConnect: {
                    //     claimSecretKey,
                    //     dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
                    // },
                    mizuwallet: {
                        manifestURL:
                            "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
                    },
                }}
                onError={(error) => {
                    console.log('Debug:--> aptose', error)
                }}
            >
                <WalletSelector />
                <div className="mt-16">{children}</div>
            </AptosWalletAdapterProvider>
        </body>
    )
}