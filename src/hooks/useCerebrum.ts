import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts';
import toast from 'react-hot-toast';

export function useCerebrum() {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Register Patient
  const registerPatient = async () => {
    try {
      await writeContract({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'registerPatient',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Toggle Data Sharing
  const toggleDataSharing = async (enabled: boolean) => {
    try {
      await writeContract({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'toggleDataSharing',
        args: [enabled],
      });
    } catch (error: any) {
      console.error('Toggle sharing error:', error);
      throw error;
    }
  };

  // Share Health Data
  const shareHealthData = async (bloodSugar: number, cholesterol: number, bmi: number) => {
    try {
      // Convert to bytes32 (simplified - in production use proper FHE encryption)
      const encBloodSugar = `0x${bloodSugar.toString(16).padStart(64, '0')}` as `0x${string}`;
      const encCholesterol = `0x${cholesterol.toString(16).padStart(64, '0')}` as `0x${string}`;
      const encBmi = `0x${Math.floor(bmi * 10).toString(16).padStart(64, '0')}` as `0x${string}`;
      const proof = '0x' as `0x${string}`; // Empty proof for now

      await writeContract({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'shareHealthData',
        args: [encBloodSugar, encCholesterol, encBmi, proof],
      });
    } catch (error: any) {
      console.error('Share data error:', error);
      throw error;
    }
  };

  // Claim Earnings
  const claimEarnings = async () => {
    try {
      await writeContract({
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'claimEarnings',
      });
    } catch (error: any) {
      console.error('Claim earnings error:', error);
      throw error;
    }
  };

  // Check if patient is registered
  const useIsRegistered = (address: string | undefined) => {
    return useReadContract({
      address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
      abi: CEREBRUM_ABI,
      functionName: 'isPatientRegistered',
      args: address ? [address as `0x${string}`] : undefined,
    });
  };

  // Get patient earnings
  const usePatientEarnings = (address: string | undefined) => {
    return useReadContract({
      address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
      abi: CEREBRUM_ABI,
      functionName: 'getPatientEarnings',
      args: address ? [address as `0x${string}`] : undefined,
    });
  };

  return {
    registerPatient,
    toggleDataSharing,
    shareHealthData,
    claimEarnings,
    useIsRegistered,
    usePatientEarnings,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
