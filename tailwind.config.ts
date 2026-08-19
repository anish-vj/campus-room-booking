import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
          extend: {
                  colors: {
                            primary: '#00236f',
                            'primary-fixed': '#dce1ff',
                            secondary: '#0058be',
                            action: '#3B82F6',
                            'action-hover': '#2170e4',
                            surface: '#f7f9fb',
                            'surface-bright': '#f7f9fb',
                            'surface-border': '#E2E8F0',
                            'surface-container-lowest': '#ffffff',
                            'surface-container-low': '#f2f4f6',
                            'surface-container': '#eceef0',
                            'surface-container-high': '#e6e8ea',
                            'on-surface': '#191c1e',
                            'on-surface-variant': '#444651',
                            'text-main': '#1E293B',
                            'text-muted': '#64748B',
                            error: '#ba1a1a',
                            'error-container': '#ffdad6',
                            'on-error-container': '#93000a',
                            success: '#10B981',
                            'success-container': '#D1FAE5',
                            'booking-success': '#10B981',
                            'booking-error': '#EF4444',
                  },
                  fontFamily: {
                            headline: ['var(--font-headline)', 'sans-serif'],
                            body: ['var(--font-body)', 'sans-serif'],
                  },
                  maxWidth: {
                            'container-max': '1200px',
                  },
                  borderRadius: {
                            DEFAULT: '0.25rem',
                            lg: '0.5rem',
                            xl: '0.75rem',
                  },
          },
    },
    plugins: [],
};

export default config;
