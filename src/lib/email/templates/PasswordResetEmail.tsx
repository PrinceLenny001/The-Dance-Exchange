import React from 'react';

interface PasswordResetEmailProps {
  name: string;
  resetLink: string;
}

export function PasswordResetEmail({ name, resetLink }: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#3B82F6', fontSize: '28px', margin: '0' }}>
          Second Act
        </h1>
        <p style={{ color: '#6B7280', fontSize: '16px', margin: '10px 0 0 0' }}>
          Dance Costume Marketplace
        </p>
      </div>

      <div style={{ backgroundColor: '#F9FAFB', padding: '30px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#1F2937', fontSize: '24px', margin: '0 0 20px 0' }}>
          Reset Your Password
        </h2>
        
        <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
          Hi {name},
        </p>
        
        <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
          We received a request to reset your password for your Second Act account. Click the button below to reset your password:
        </p>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={resetLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Reset Password
          </a>
        </div>

        <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: '1.6', margin: '20px 0 0 0' }}>
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style={{ color: '#3B82F6', fontSize: '14px', wordBreak: 'break-all', margin: '10px 0 0 0' }}>
          {resetLink}
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 10px 0' }}>
          This link will expire in 1 hour for security reasons.
        </p>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 10px 0' }}>
          If you didn't request this password reset, please ignore this email.
        </p>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: '0' }}>
          If you continue to have problems, please contact our support team.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '30px', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '0' }}>
          © {new Date().getFullYear()} Second Act. All rights reserved.
        </p>
      </div>
    </div>
  );
}
