import { useReadContract } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts';

export const useCerebrum = () => {
  const { data: totalPatients } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalPatients',
  });

  const { data: platformFeePercent } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'PLATFORM_FEE_PERCENT',
  });

  return {
    totalPatients: totalPatients ? Number(totalPatients) : 0,
    platformFeePercent: platformFeePercent ? Number(platformFeePercent) : 20,
  };
};
