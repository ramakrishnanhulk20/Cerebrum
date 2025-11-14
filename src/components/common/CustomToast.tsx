import toast, { Toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, ExternalLink, X } from 'lucide-react';

interface CustomToastProps {
  t: Toast;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  txHash?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const CustomToast = ({ t, type, message, description, txHash, action }: CustomToastProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'text-emerald-400 border-emerald-500/50',
    error: 'text-red-400 border-red-500/50',
    warning: 'text-yellow-400 border-yellow-500/50',
    info: 'text-blue-400 border-blue-500/50',
  };

  const Icon = icons[type];

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-black/95 backdrop-blur-xl border-2 ${colors[type]} rounded-xl shadow-2xl pointer-events-auto flex`}
    >
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 ${colors[type]} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{message}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-400">{description}</p>
            )}
            
            {/* Transaction Hash Link */}
            {txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View on Etherscan
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Action Button */}
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  toast.dismiss(t.id);
                }}
                className="mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions for different toast types
export const showSuccessToast = (
  message: string,
  options?: {
    description?: string;
    txHash?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
  }
) => {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        type="success"
        message={message}
        description={options?.description}
        txHash={options?.txHash}
        action={options?.action}
      />
    ),
    { duration: options?.duration || 5000 }
  );
};

export const showErrorToast = (
  message: string,
  options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
  }
) => {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        type="error"
        message={message}
        description={options?.description}
        action={options?.action}
      />
    ),
    { duration: options?.duration || 6000 }
  );
};

export const showWarningToast = (
  message: string,
  options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
  }
) => {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        type="warning"
        message={message}
        description={options?.description}
        action={options?.action}
      />
    ),
    { duration: options?.duration || 5000 }
  );
};

export const showInfoToast = (
  message: string,
  options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
  }
) => {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        type="info"
        message={message}
        description={options?.description}
        action={options?.action}
      />
    ),
    { duration: options?.duration || 4000 }
  );
};

// Transaction-specific toast
export const showTxToast = (
  message: string,
  txHash: string,
  options?: {
    description?: string;
    duration?: number;
  }
) => {
  return showSuccessToast(message, {
    description: options?.description,
    txHash,
    duration: options?.duration || 8000,
  });
};
