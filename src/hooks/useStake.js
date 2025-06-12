'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

import { parseToBigInt } from '@/lib/formatBigInt';
import { nftStakingContractAddress, nftStakingContractABI } from '@/utils/constants';



const useSwapToken = () => {
  const { chain, address } = useAccount();

  const [amountToStake, setAmountToStake] = useState();

  const {
    data: stakeHash,
    writeContract: stakeToken,
    isPending: writeLoading,
    isError: writeError,
    reset: resetStake,
  } = useWriteContract();

  const { isSuccess: hashSuccess, isLoading: hashLoading } =
    useWaitForTransactionReceipt({
      hash: stakeHash,
      query: {
        enabled: Boolean(stakeHash),
      },
    });

  // useEffect(() => {
  //   if (stakeHash && amountToStake && address) {
  //     // handleRefetchBalance();
  //     // setStorageValue(amountToSwap, address, swapeHash);
  //   }
  // }, [hashSuccess, stakeHash, address]);

  const clearTransaction = useCallback(() => {
    resetStake();
  }, []);

  return {
    hash: stakeHash,
    handleStake: ({ amount }) => {
      try {
        const tokenId = parseToBigInt(
          amount,
          18 // TODO: change to dynamic value
        );
        setAmountToStake(amount);
        stakeToken({
          address: nftStakingContractAddress,
          abi: nftStakingContractABI,
          functionName: 'stake',
          args: [tokenId], // Corrected to match contract function signature
        });
      } catch (error) {
        console.error('Staking error:', error);
        // You can add additional error handling here if needed
      }
    },
    argsError: !address,
    mutateStatus: {
      isError: writeError,
      isLoading: writeLoading || hashLoading,
      isSuccess: hashSuccess,
    },
    clearTransaction,
  };
};

export { useSwapToken };
