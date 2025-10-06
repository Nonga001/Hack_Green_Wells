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
    <div className={`mt-3 ${className} animate-fade-in`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getStrengthColor()} animate-pulse`}
            style={{ width: `${(strengthScore / requirements.length) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full transition-all duration-300 ${
          strengthScore === 0 ? 'bg-gray-100 text-gray-600' :
          strengthScore <= 2 ? 'bg-red-100 text-red-700' :
          strengthScore <= 3 ? 'bg-yellow-100 text-yellow-700' :
          strengthScore <= 4 ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 text-xs transition-all duration-300 ${
              req.met ? 'animate-slide-in-left' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 transform ${
              req.met 
                ? 'bg-green-500 text-white shadow-lg scale-110' 
                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
            }`}>
              {req.met ? (
                <span className="animate-bounce-in">✓</span>
              ) : (
                <span>○</span>
              )}
            </span>
            <span className={`transition-colors duration-300 ${
              req.met 
                ? 'text-green-700 font-medium' 
                : 'text-gray-500'
            }`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
