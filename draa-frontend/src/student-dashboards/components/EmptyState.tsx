import React from'react';
import { Box, Typography, Button } from'@mui/material';
import { alpha } from'@mui/material/styles';
import { motion } from'framer-motion';

export type EmptyStateType ='no-data' |'no-courses' |'no-books' |'no-exams' |'no-results' |'no-wishlist' |'no-purchases' |'no-blogs' |'no-sessions' |'no-rewards' |'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  size?:'small' |'medium' |'large';
}

const illustrationSvgs: Record<EmptyStateType, string> = {
'no-data': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="80" width="200" height="140" rx="16" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" strokeDasharray="6 4"/>
    <path d="M110 150h100M110 170h60" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="200" cy="60" r="24" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2"/>
    <path d="M192 60l5 5 10-10" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="260" cy="100" r="8" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1.5"/>
    <circle cx="70" cy="220" r="6" fill="#E0E7FF" stroke="#818CF8" strokeWidth="1.5"/>
    <path d="M150 240c0-5 4-9 9-9s9 4 9 9" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  </svg>`,
'no-courses': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="60" width="240" height="160" rx="16" fill="#F0FDF4" stroke="#10B981" strokeWidth="2"/>
    <rect x="40" y="60" width="240" height="40" rx="16" fill="#D1FAE5"/>
    <rect x="60" y="80" width="16" height="16" rx="4" fill="#10B981"/>
    <rect x="84" y="84" width="80" height="8" rx="4" fill="#6EE7B7"/>
    <circle cx="160" cy="160" r="40" fill="#ECFDF5" stroke="#10B981" strokeWidth="2"/>
    <path d="M148 160l8 8 16-16" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="120" y="208" width="80" height="12" rx="6" fill="#D1FAE5"/>
    <circle cx="280" cy="80" r="12" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1.5"/>
    <circle cx="50" cy="230" r="8" fill="#F5F3FF" stroke="#818CF8" strokeWidth="1.5"/>
  </svg>`,
'no-books': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="80" y="50" width="160" height="180" rx="12" fill="#FFF7ED" stroke="#F59E0B" strokeWidth="2"/>
    <rect x="100" y="70" width="50" height="70" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    <rect x="160" y="70" width="50" height="70" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    <rect x="100" y="150" width="110" height="10" rx="5" fill="#FDE68A"/>
    <rect x="100" y="166" width="80" height="8" rx="4" fill="#FDE68A"/>
    <rect x="100" y="180" width="60" height="8" rx="4" fill="#FDE68A"/>
    <circle cx="260" cy="90" r="16" fill="#F5F3FF" stroke="#A855F7" strokeWidth="2"/>
    <path d="M254 90h12M260 84v12" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="40" cy="200" r="10" fill="#F5F3FF" stroke="#818CF8" strokeWidth="1.5"/>
    <path d="M50 240c0-5 4-9 9-9s9 4 9 9" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>`,
'no-exams': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="50" width="200" height="160" rx="16" fill="#FDF2F8" stroke="#EC4899" strokeWidth="2"/>
    <rect x="80" y="70" width="160" height="24" rx="8" fill="#FCE7F3"/>
    <rect x="80" y="100" width="160" height="24" rx="8" fill="#FCE7F3"/>
    <rect x="80" y="130" width="160" height="24" rx="8" fill="#FCE7F3"/>
    <rect x="80" y="160" width="100" height="16" rx="8" fill="#FBCFE8"/>
    <circle cx="240" cy="190" r="30" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2"/>
    <path d="M232 190l6 6 12-12" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="60" cy="100" r="12" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1.5"/>
    <path d="M100 240c0-6 5-11 11-11s11 5 11 11" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>`,
'no-results': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="160" cy="130" r="70" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2"/>
    <path d="M130 130l20 20 30-30" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M120 180h80" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round"/>
    <rect x="80" y="210" width="160" height="20" rx="10" fill="#EDE9FE"/>
    <circle cx="260" cy="70" r="14" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1.5"/>
    <circle cx="50" cy="150" r="10" fill="#F5F3FF" stroke="#818CF8" strokeWidth="1.5"/>
    <path d="M80 250c0-5 4-9 9-9s9 4 9 9" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>`,
'no-wishlist': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M160 220c0-35 28-60 63-60 20 0 37 8 48 22 11-14 28-22 48-22 35 0 63 25 63 60 0 70-111 100-111 100S80 290 80 220z" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2"/>
    <path d="M160 220c0-35 28-60 63-60 20 0 37 8 48 22 11-14 28-22 48-22 35 0 63 25 63 60 0 70-111 100-111 100S80 290 80 220z" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="6 4" opacity="0.5"/>
    <path d="M120 190l15 15 25-25" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
    <circle cx="260" cy="60" r="16" fill="#F5F3FF" stroke="#A855F7" strokeWidth="2"/>
    <path d="M254 60h12M260 54v12" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="50" cy="200" r="10" fill="#F5F3FF" stroke="#818CF8" strokeWidth="1.5"/>
  </svg>`,
'no-purchases': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="60" width="200" height="160" rx="16" fill="#F0F9FF" stroke="#0EA5E9" strokeWidth="2"/>
    <rect x="90" y="100" width="60" height="50" rx="8" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="1.5"/>
    <rect x="160" y="100" width="60" height="50" rx="8" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="1.5"/>
    <rect x="90" y="160" width="130" height="12" rx="6" fill="#BAE6FD"/>
    <rect x="90" y="180" width="90" height="10" rx="5" fill="#BAE6FD"/>
    <circle cx="240" cy="80" r="20" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2"/>
    <path d="M232 80h16M240 72v16" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
    <path d="M100 240c0-5 5-10 10-10s10 5 10 10" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>`,
'no-blogs': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="50" width="200" height="180" rx="16" fill="#FFF7ED" stroke="#F59E0B" strokeWidth="2"/>
    <rect x="80" y="70" width="160" height="20" rx="6" fill="#FEF3C7"/>
    <rect x="80" y="96" width="120" height="14" rx="7" fill="#FEF3C7"/>
    <rect x="80" y="116" width="140" height="14" rx="7" fill="#FEF3C7"/>
    <rect x="80" y="136" width="100" height="14" rx="7" fill="#FEF3C7"/>
    <rect x="80" y="160" width="160" height="50" rx="10" fill="#FED7AA"/>
    <circle cx="260" cy="80" r="16" fill="#F5F3FF" stroke="#A855F7" strokeWidth="2"/>
    <path d="M254 80h12M260 74v12" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
    <path d="M80 240c0-5 5-10 10-10s10 5 10 10" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>`,
'no-sessions': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="60" width="200" height="160" rx="16" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2"/>
    <circle cx="160" cy="140" r="45" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="2"/>
    <polygon points="148,125 148,155 175,140" fill="#8B5CF6"/>
    <rect x="110" y="200" width="100" height="16" rx="8" fill="#DDD6FE"/>
    <rect x="125" y="216" width="70" height="10" rx="5" fill="#DDD6FE"/>
    <circle cx="270" cy="90" r="14" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1.5"/>
    <circle cx="50" cy="130" r="10" fill="#F5F3FF" stroke="#818CF8" strokeWidth="1.5"/>
    <path d="M140 250c0-5 5-9 9-9s9 4 9 9" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>`,
'no-rewards': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="160" cy="130" r="60" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2"/>
    <circle cx="160" cy="130" r="45" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
    <text x="152" y="140" font-size="36" font-weight="800" fill="#F59E0B" font-family="sans-serif">$</text>
    <rect x="80" y="200" width="160" height="16" rx="8" fill="#FDE68A"/>
    <rect x="120" y="216" width="80" height="12" rx="6" fill="#FDE68A"/>
    <circle cx="270" cy="70" r="14" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1.5"/>
    <path d="M264 70l12 12" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="50" cy="190" r="10" fill="#F5F3FF" stroke="#818CF8" strokeWidth="1.5"/>
    <path d="M110 250c0-5 5-10 10-10s10 5 10 10" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>`,
'error': `<svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="160" cy="130" r="70" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2"/>
    <circle cx="160" cy="130" r="50" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2"/>
    <path d="M145 110h30M145 150h30" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="270" cy="80" r="14" fill="#F5F3FF" stroke="#A855F7" strokeWidth="1.5"/>
    <circle cx="40" cy="180" r="12" fill="#F5F3FF" stroke="#818CF8" strokeWidth="1.5"/>
  </svg>`,
};

const defaultContent: Record<EmptyStateType, { title: string; description: string; actionLabel?: string }> = {
'no-data': { title:'No Data Available', description:'There is nothing here yet. Start by adding some content to get started.' },
'no-courses': { title:'No Courses Yet', description:'You haven\'t enrolled in any courses. Browse our catalog and start learning today!' },
'no-books': { title:'Your Library is Empty', description:'You haven\'t purchased any books yet. Explore our collection and start reading!' },
'no-exams': { title:'No Exams Scheduled', description:'There are no upcoming or past exams. Check back later for new examinations.' },
'no-results': { title:'No Results Found', description:'You haven\'t taken any tests yet. Start practicing to see your performance here.' },
'no-wishlist': { title:'Your Wishlist is Empty', description:'Save courses, books, and test series you love by clicking the heart icon.' },
'no-purchases': { title:'No Purchase History', description:'You haven\'t made any purchases yet. Explore our offerings and get started!' },
'no-blogs': { title:'No Blogs Written Yet', description:'Share your knowledge by writing your first blog post. Earn rewards for every approved blog!' },
'no-sessions': { title:'No Live Sessions Scheduled', description:'There are no upcoming live sessions. Stay tuned for interactive classes and workshops.' },
'no-rewards': { title:'No Rewards Earned Yet', description:'Start earning coins by writing blogs, acing exams, and referring friends. Your journey begins here!' },
'error': { title:'Something Went Wrong', description:'An error occurred while loading data. Please try again or contact support.' },
};

const sizeMap = {
  small: { svg: 200, icon: 48, title:'h6', desc:'body2' },
  medium: { svg: 280, icon: 64, title:'h5', desc:'body1' },
  large: { svg: 360, icon: 80, title:'h4', desc:'body1' },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type ='no-data',
  title,
  description,
  actionLabel,
  onAction,
  icon,
  size ='medium',
}) => {
  const { svg: svgSize, icon: iconSize, title: titleTag, desc: descTag } = sizeMap[size];
  const defaults = defaultContent[type];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        py: { xs: 6, sm: 8 },
        px: 3,
        textAlign:'center',
        bgcolor: alpha('#6366f1', 0.015),
        borderRadius: 3,
        border:'2px dashed',
        borderColor: alpha('#6366f1', 0.15),
        position:'relative',
        overflow:'hidden',
        minHeight: size ==='large' ? 400 : size ==='medium' ? 320 : 240,
      }}
    >
      {/* Background decorative elements */}
      <Box sx={{ position:'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius:'50%', bgcolor: alpha('#6366f1', 0.04), pointerEvents:'none' }} />
      <Box sx={{ position:'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius:'50%', bgcolor: alpha('#8b5cf6', 0.04), pointerEvents:'none' }} />

      {/* SVG Illustration */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        sx={{
          width: svgSize,
          height: svgSize,
          mb: 3,
'& svg': {
            width:'100%',
            height:'100%',
          },
        }}
        dangerouslySetInnerHTML={{ __html: illustrationSvgs[type] || illustrationSvgs['no-data'] }}
      />

      {/* Title */}
      <Typography
        variant={titleTag as any}
        sx={{
          fontWeight: 800,
          color:'text.primary',
          mb: 1.5,
          maxWidth: 400,
        }}
      >
        {title ?? defaults.title}
      </Typography>

      {/* Description */}
      <Typography
        variant={descTag as any}
        sx={{
          color:'text.secondary',
          fontWeight: 500,
          maxWidth: 440,
          mb: actionLabel ? 3 : 0,
          lineHeight: 1.6,
        }}
      >
        {description ?? defaults.description}
      </Typography>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          component={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            borderRadius: 2,
            fontWeight: 800,
            px: 4,
            py: 1.2,
            background:'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow:'0 4px 14px rgba(99, 102, 241, 0.3)',
'&:hover': {
              background:'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow:'0 6px 20px rgba(99, 102, 241, 0.4)',
            },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;