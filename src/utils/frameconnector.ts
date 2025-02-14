import sdk from "@farcaster/frame-sdk";
import { fromHex, getAddress, numberToHex,SwitchChainError } from "viem";
import { mainnet } from "viem/chains";
import { ChainNotConfiguredError, createConnector } from "wagmi";

frameConnector.type = "frameConnector" as const;

export function frameConnector() {
  let connected = false;

  return createConnector<typeof sdk.wallet.ethProvider>((config) => ({
    id: "farcaster",
    name: "Farcaster Wallet",
    type: frameConnector.type,

    async setup() {
      await this.connect({ chainId: mainnet.id });
    },
    async connect({ chainId } = {}) {
      try {
        const provider = await this.getProvider();
        
        if (!provider) {
          throw new Error('Frame provider not available. Make sure you are in a Frame environment.');
        }

        console.log('Frame provider state:', {
          hasProvider: !!provider,
          hasRequest: typeof provider.request === 'function',
          provider: provider
        });

        let accounts;
        try {
          if (typeof provider.request !== 'function') {
            throw new Error('Provider request method is not a function');
          }

          accounts = await provider.request({
            method: "eth_requestAccounts",
          });

          console.log('Accounts response:', accounts);
        } catch (error) {
          console.error('RPC request failed:', {
            error,
            errorType: typeof error,
            errorKeys: error ? Object.keys(error) : [],
            errorString: String(error)
          });

          // Handle different types of errors
          if (error instanceof Error) {
            throw error;
          } else if (typeof error === 'string') {
            throw new Error(error);
          } else if (error && typeof error === 'object') {
            throw new Error((error as { message?: string })?.message || 'Unknown RPC error');
          } else {
            throw new Error('Failed to request accounts: Unknown error type');
          }
        }

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned from provider');
        }

        let currentChainId = await this.getChainId();
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({ chainId });
          currentChainId = chain.id;
        }

        connected = true;

        return {
          accounts: accounts.map((x) => getAddress(x)),
          chainId: currentChainId,
        };
      } catch (error) {
        console.error('Frame connection error:', {
          error,
          errorType: typeof error,
          errorMessage: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    },
    async disconnect() {
      connected = false;
    },
    async getAccounts() {
      if (!connected) throw new Error("Not connected");
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      return accounts?.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      if (!hexChainId) return mainnet.id;
      return fromHex(hexChainId, "number");
    },
    async isAuthorized() {
      if (!connected) {
        return false;
      }

      const accounts = await this.getAccounts();
      return !!accounts?.length;
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit("change", {
          accounts: accounts?.map((x) => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit("change", { chainId });
    },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async onDisconnect() {
      config.emitter.emit("disconnect");
      connected = false;
    },
    async getProvider() {
      if (typeof window === 'undefined') {
        throw new Error('Frame provider is only available in browser environment');
      }
      
      if (!sdk.wallet?.ethProvider) {
        throw new Error('Frame ethProvider not available');
      }
      
      return sdk.wallet.ethProvider;
    },
  }));
}