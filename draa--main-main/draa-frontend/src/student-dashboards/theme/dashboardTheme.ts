import { createTheme, alpha } from'@mui/material/styles';

export const getDashboardTheme = (mode:'light' |'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main:'#6366f1',
        light:'#818cf8',
        dark:'#4f46e5',
        contrastText:'#ffffff',
      },
      secondary: {
        main:'#ec4899',
        light:'#f472b6',
        dark:'#db2777',
      },
      background: {
        default: mode ==='light' ?'#f8fafc' :'#0f172a',
        paper: mode ==='light' ?'#ffffff' :'#1e293b',
      },
      text: {
        primary: mode ==='light' ?'#0f172a' :'#ffffff',
        secondary: mode ==='light' ?'#64748b' :'#cbd5e1',
      },
      divider: mode ==='light' ?'rgba(0,0,0,0.08)' :'rgba(255,255,255,0.12)',
      success: {
        main:'#10b981',
        light:'#6ee7b7',
        dark:'#059669',
      },
      warning: {
        main:'#f59e0b',
        light:'#fcd34d',
        dark:'#d97706',
      },
      error: {
        main:'#ef4444',
        light:'#fca5a5',
        dark:'#dc2626',
      },
      info: {
        main:'#0ea5e9',
        light:'#7dd3fc',
        dark:'#0284c7',
      },
    },
    typography: {
      fontFamily:"'Plus Jakarta Sans', sans-serif",
      h1: { fontSize:'2.5rem', fontWeight: 800, letterSpacing:'-0.02em' },
      h2: { fontSize:'2rem', fontWeight: 800, letterSpacing:'-0.02em' },
      h3: { fontSize:'1.75rem', fontWeight: 700, letterSpacing:'-0.01em' },
      h4: { fontSize:'1.5rem', fontWeight: 700, letterSpacing:'-0.01em' },
      h5: { fontSize:'1.25rem', fontWeight: 700 },
      h6: { fontSize:'1rem', fontWeight: 700 },
      subtitle1: { fontSize:'1rem', fontWeight: 600 },
      subtitle2: { fontSize:'0.875rem', fontWeight: 600 },
      body1: { fontSize:'1rem', lineHeight: 1.6 },
      body2: { fontSize:'0.875rem', lineHeight: 1.6 },
      caption: { fontSize:'0.75rem', fontWeight: 600 },
      button: { textTransform:'none', fontWeight: 700 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            borderRadius:'12px',
          },
          body: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0f172a',
            color: mode === 'light' ? '#0f172a' : '#f8fafc',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
          ...(mode === 'dark' ? {
            // Dark Mode high-contrast overrides to prevent global style.css overrides
            'h1, h2, h3, h4, h5, h6': {
              color: '#ffffff !important',
            },
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              color: '#ffffff !important',
            },
            '.MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, .MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6': {
              color: '#ffffff !important',
            },
            '.MuiTypography-colorTextPrimary': {
              color: '#ffffff !important',
            },
            '.MuiTypography-colorTextSecondary': {
              color: '#cbd5e1 !important',
            },
            '.MuiTypography-body1': {
              color: '#f8fafc !important',
            },
            '.MuiTypography-body2': {
              color: '#cbd5e1 !important',
            },
            '.MuiTypography-caption': {
              color: '#cbd5e1 !important',
            },
            '.MuiTypography-subtitle1': {
              color: '#ffffff !important',
            },
            '.MuiTypography-subtitle2': {
              color: '#cbd5e1 !important',
            },
            // Card specific resets for text inside Card components
            '.MuiCard-root h1, .MuiCard-root h2, .MuiCard-root h3, .MuiCard-root h4, .MuiCard-root h5, .MuiCard-root h6': {
              color: '#ffffff !important',
            },
            '.MuiCard-root p, .MuiCard-root span': {
              color: 'inherit',
            },
            '.MuiCard-root .MuiTypography-colorTextSecondary': {
              color: '#cbd5e1 !important',
            },
            '.MuiCard-root .MuiTypography-caption': {
              color: '#cbd5e1 !important',
            },
          } : {
            // Light Mode clean resets to ensure alignment with Edumon styling
            'h1, h2, h3, h4, h5, h6': {
              color: '#0f172a !important',
            },
            '.MuiTypography-h1, .MuiTypography-h2, .MuiTypography-h3, .MuiTypography-h4, .MuiTypography-h5, .MuiTypography-h6': {
              color: '#0f172a !important',
            },
            '.MuiTypography-body1': {
              color: '#0f172a !important',
            },
            '.MuiTypography-body2': {
              color: '#64748b !important',
            },
            '.MuiTypography-caption': {
              color: '#64748b !important',
            },
            '.MuiTypography-subtitle1': {
              color: '#0f172a !important',
            },
            '.MuiTypography-subtitle2': {
              color: '#64748b !important',
            },
          })
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding:'10px 24px',
            boxShadow:'none',
            fontWeight: 700,
            textTransform:'none',
'&:hover': {
              boxShadow: mode ==='light' ?'0 4px 14px rgba(99, 102, 241, 0.2)' :'0 4px 20px rgba(0,0,0,0.4)',
            },
          },
          containedPrimary: {
            background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
'&:hover': {
              background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage:'none',
            boxShadow: mode ==='light' 
              ?'0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.02)' 
              :'0 4px 20px rgba(0,0,0,0.3)',
            border: mode ==='light' 
              ?'1px solid rgba(226, 232, 240, 0.6)' 
              :'1px solid rgba(255, 255, 255, 0.05)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage:'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage:'none',
          },
        },
      },
    },
  });
};

const dashboardTheme = getDashboardTheme('light');
export default dashboardTheme;