import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { LogLevel, LogOrStringHandler, RollupLog } from 'rollup'

const walletConnectClientPackages = new Set([
  '@walletconnect/ethereum-provider',
  '@walletconnect/universal-provider',
  '@walletconnect/sign-client',
])

const walletConnectRuntimePackages = new Set([
  '@walletconnect/core',
  '@walletconnect/environment',
  '@walletconnect/events',
  '@walletconnect/heartbeat',
  '@walletconnect/jsonrpc-http-connection',
  '@walletconnect/jsonrpc-provider',
  '@walletconnect/jsonrpc-types',
  '@walletconnect/jsonrpc-utils',
  '@walletconnect/jsonrpc-ws-connection',
  '@walletconnect/keyvaluestorage',
  '@walletconnect/logger',
  '@walletconnect/relay-api',
  '@walletconnect/relay-auth',
  '@walletconnect/safe-json',
  '@walletconnect/time',
  '@walletconnect/types',
  '@walletconnect/utils',
  '@walletconnect/window-getters',
  '@walletconnect/window-metadata',
])

function getManualChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined
  }

  const modulePath = id.split('node_modules/').pop() ?? ''
  const packageName = modulePath.startsWith('@')
    ? modulePath.split('/').slice(0, 2).join('/')
    : modulePath.split('/')[0]

  if (
    packageName === 'react' ||
    packageName === 'react-dom' ||
    packageName === 'scheduler' ||
    packageName === 'use-sync-external-store'
  ) {
    return 'react-vendor'
  }

  if (
    packageName === 'i18next' ||
    packageName === 'react-i18next'
  ) {
    return 'i18n-vendor'
  }

  if (
    packageName === 'framer-motion' ||
    packageName === 'motion-dom' ||
    packageName === 'motion-utils' ||
    packageName === 'lucide-react'
  ) {
    return 'ui-vendor'
  }

  if (packageName === '@tanstack/react-query' || packageName === '@tanstack/query-core') {
    return 'query-vendor'
  }

  if (
    packageName === 'wagmi' ||
    packageName === '@wagmi/core'
  ) {
    return 'web3-state-vendor'
  }

  if (
    packageName === '@wagmi/connectors'
  ) {
    return 'web3-wagmi-connectors-vendor'
  }

  if (walletConnectClientPackages.has(packageName)) {
    return 'web3-walletconnect-client-vendor'
  }

  if (walletConnectRuntimePackages.has(packageName)) {
    return 'web3-walletconnect-runtime-vendor'
  }

  if (packageName.startsWith('@reown')) {
    return 'web3-reown-vendor'
  }

  if (
    packageName === 'viem' ||
    packageName === 'abitype' ||
    packageName === 'ox' ||
    packageName === 'porto' ||
    packageName.startsWith('@noble')
  ) {
    return 'web3-chain-vendor'
  }

  if (packageName === '@rainbow-me/rainbowkit') {
    return 'web3-ui-vendor'
  }

  return 'vendor'
}

function shouldIgnoreRollupLog(level: LogLevel, log: RollupLog): boolean {
  return (
    level === 'warn' &&
    log.code === 'INVALID_ANNOTATION' &&
    log.id?.includes('/node_modules/') === true
  )
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      onLog(level, log, defaultHandler: LogOrStringHandler) {
        if (shouldIgnoreRollupLog(level, log)) {
          return
        }

        defaultHandler(level, log)
      },
      output: {
        manualChunks: getManualChunk,
      },
    },
  },
})
