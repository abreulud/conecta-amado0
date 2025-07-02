import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { cityOptions, stateOptions } from '../../api/formOptions';
import { StepIndicator } from './StepIndicator';

export const AuthForm = ({
  greetings = false,
  title,
  subtitle,
  step = 1,
  setStep = () => {},
  fields = [],
  values = {},
  onFieldChange,
  buttonText,
  footerText,
  footerLink,
  forgotPasswordLink,
  keepLoggedInOption = false,
  onSubmit,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const selectedState = values.state || '';

  return (
    <div className="w-full md:w-1/2 p-10 bg-[#e7ecfa] rounded-lg shadow-md max-w-[505px] flex flex-col justify-between">
      <div>
        <StepIndicator step={step} onStepClick={setStep} />
        {greetings && <h2 className="text-xl text-gray-500">Bem-vinde!</h2>}
        <h1 className="text-4xl font-bold text-black">{title}</h1>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>

      <form className="space-y-4 my-14" onSubmit={onSubmit}>
        {fields.map((field, idx) => {
          const isPassword = field.type === 'password';

          if (field.type === 'select-phone') {
            return (
              <div key={idx}>
                <label className="text-sm block mb-1">{field.label}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full rounded border border-gray-300 text-gray-400 px-3 py-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue"
                    value={values[field.name] || ''}
                    onChange={e => onFieldChange(field.name, e.target.value)}
                  />
                </div>
              </div>
            );
          }

          if (field.type === 'select') {
            // Handle state field
            if (field.name === 'state') {
              return (
                <div key={idx}>
                  <label className="text-sm block mb-1">{field.label}</label>
                  <select
                    value={values.state || ''}
                    onChange={e => onFieldChange(field.name, e.target.value)}
                    className="w-full rounded border text-gray-400 border-gray-300 px-3 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  >
                    {stateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // Handle city field
            if (field.name === 'city') {
              const cities = cityOptions[selectedState] || [];
              return (
                <div key={idx}>
                  <label className="text-sm block mb-1">{field.label}</label>
                  <select
                    value={values.city || ''}
                    disabled={!selectedState}
                    onChange={e => onFieldChange(field.name, e.target.value)}
                    className="w-full rounded border border-gray-300 text-gray-400 px-3 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                    required
                  >
                    {cities.map(city => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // General select field
            return (
              <div key={idx}>
                <label className="text-sm block mb-1">{field.label}</label>
                <select
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={e => onFieldChange(field.name, e.target.value)}
                  className="w-full rounded border border-gray-300 text-gray-400 px-3 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                  required
                >
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // Default: text/password input
          return (
            <div key={idx}>
              <label className="text-sm block mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type={
                    isPassword && showPassword ? 'text' : field.type || 'text'
                  }
                  placeholder={field.placeholder}
                  className="w-full rounded border border-gray-300 text-gray-400 px-3 py-4 focus:outline-none focus:ring-2 focus:ring-blue"
                  value={values[field.name] || ''}
                  onChange={e => onFieldChange(field.name, e.target.value)}
                  required
                />
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-5 text-gray-400 focus:outline-none"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {(keepLoggedInOption || forgotPasswordLink) && (
          <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
            {keepLoggedInOption && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="keepLogged"
                  className="text-xs accent-black"
                  checked={values.keepLoggedIn || false}
                  onChange={e =>
                    onFieldChange('keepLoggedIn', e.target.checked)
                  }
                />
                <label htmlFor="keepLogged" className="text-xs">
                  Lembrar-me
                </label>
              </div>
            )}
            {forgotPasswordLink && (
              <Link
                to={forgotPasswordLink}
                className="accent-black text-xs hover:underline"
              >
                Esqueceu a senha?
              </Link>
            )}
          </div>
        )}

        {error && (
          <div className="bg-light-red border border-red text-dark-red px-4 py-3 rounded relative text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-black font-bold text-white py-4 rounded hover:bg-gray-800 transition"
        >
          {buttonText}
        </button>
      </form>

      {footerText && footerLink?.text && (
        <p className="text-gray-600 text-center">
          {footerText}{' '}
          <Link
            to={footerLink.to}
            className="text-black font-medium hover:underline"
          >
            {footerLink.text}
          </Link>
        </p>
      )}
    </div>
  );
};
