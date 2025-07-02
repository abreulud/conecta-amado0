import React from 'react';
export const StepIndicator = ({ step, onStepClick }) => {
  const steps = [1, 2];
  if (step === 0) return;

  return (
    <div className="flex items-center justify-center mb-6 space-x-2">
      {steps.map((s, idx) => (
        <React.Fragment key={s}>
          <div
            onClick={() => step > s && onStepClick(s)}
            className={`w-3 h-3 rounded-full cursor-pointer transition
                  ${step >= s ? 'bg-dark-blue' : 'bg-gray-300'}
                  ${step > s ? 'hover:opacity-80' : 'cursor-default'}
                `}
          />

          {idx < steps.length - 1 && (
            <div
              className={`w-16 h-1 transition
                    ${step > s ? 'bg-dark-blue' : 'bg-gray-300'}
                  `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
