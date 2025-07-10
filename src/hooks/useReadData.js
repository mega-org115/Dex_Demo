import { useCallback } from 'react';
import { erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { formatBigInt } from '@/lib/formatBigInt';
import { getBridgeAddress } from '@/lib/getBridgeAddress';


export function useReadData() {
  const { chain, address } = useAccount();
  const bridgeAddress = getBridgeAddress(chain?.id);

  const {
    data: tokenAddress,
    isLoading: tokenAddressLoading,
    isError: tokenAddressError,
  } = useReadContract({
    abi: [
      {
        inputs: [],
        name: 'token',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'token',
    address: bridgeAddress,
  });
  const {
    data: symbol,
    isLoading: symbolLoading,
    isError: symbolError,
  } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'symbol',
  });

  const {
    data: decimals,
    isLoading: decimalsLoading,
    isError: decimalsError,
  } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'decimals',
  });

  const {
    data: balanceBInt,
    isLoading: balanceBIntLoading,
    isError: balanceBIntError,
    refetch: refetchBalance,
  } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'balanceOf',
    args: [address],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRefetchBalance = useCallback(() => refetchBalance(), []);

  const balance =
    balanceBInt !== undefined && decimals
      ? {
          bigInt: balanceBInt,
          int: formatBigInt(balanceBInt, decimals),
        }
      : undefined;
  const token =
    symbol && decimals
      ? {
          symbol,
          decimals,
        }
      : undefined;
  return {
    balance: {
      value: balance,
      status: {
        isLoading: balanceBIntLoading || decimalsLoading || tokenAddressLoading,
        isError: balanceBIntError || decimalsError || tokenAddressError,
        isSuccess: balance !== undefined,
      },
    },
    token: {
      value: token,
      status: {
        isLoading: symbolLoading,
        isError: symbolError,
        isSuccess: symbol !== undefined,
      },
    },
    handleRefetchBalance,
  };
}
