import React from 'react';

interface PasswordStrengthCheckerProps {
  password: string;
  className?: string;
  onStrengthChange?: (isStrong: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function PasswordStrengthChecker({ password, className = '', onStrengthChange }: PasswordStrengthCheckerProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const allRequirementsMet = requirements.every(req => req.met);
  const strengthScore = requirements.filter(req => req.met).length;
  
  // Notify parent component about strength change
  React.useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(allRequirementsMet);
    }
  }, [allRequirementsMet, onStrengthChange]);
  
  const getStrengthColor = () => {
    if (strengthScore === 0) return 'bg-gray-200';
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 3) return 'bg-yellow-500';
    if (strengthScore <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strengthScore === 0) return 'No password entered';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 3) return 'Fair';
    if (strengthScore <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(strengthScore / requirements.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-600">
          {getStrengthText()}
        </span>
      </div>
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
              req.met ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {req.met ? '✓' : '○'}
            </span>
            <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
