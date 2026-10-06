// Concise explainer banner for the knockout format
// Collapsible - when dismissed, shows a small "What is this?" link

import { useState } from 'react';

import { Box, Typography, Button, IconButton, Link } from '@mui/material';
import { Info, X, ChevronDown } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

import { KNOCKOUT_QUALIFIERS, ELIMINATIONS_PER_ROUND, KNOCKOUT_RACES } from 'src/constants';

const STORAGE_KEY = 'gpp-explainer-collapsed';

interface KnockoutExplainerProps {
  compact?: boolean;
}

export function KnockoutExplainer({ compact = false }: KnockoutExplainerProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const handleCollapse = (): void => {
    setIsCollapsed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleExpand = (): void => {
    setIsCollapsed(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Collapsed state - just a subtle link
  if (isCollapsed) {
    return (
      <Box sx={{ mb: 2 }}>
        <Link
          component="button"
          onClick={handleExpand}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            fontSize: '0.875rem',
            cursor: 'pointer',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <Info size={14} />
          What is Grand Prix Knockout?
          <ChevronDown size={14} />
        </Link>
      </Box>
    );
  }

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          bgcolor: 'action.hover',
          borderRadius: 1,
          mb: 3,
          position: 'relative',
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <Box sx={{ flex: 1, pr: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            This is an alternative championship using real F1 results. Top {KNOCKOUT_QUALIFIERS}{' '}
            drivers advance to the knockout, {ELIMINATIONS_PER_ROUND} are eliminated each round, and
            the final race crowns the Grand Prix Knockout Champion.{' '}
            <Button
              component={RouterLink}
              to="/about"
              size="small"
              sx={{ textTransform: 'none', p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}
            >
              Learn more
            </Button>
          </Typography>
        </Box>
        <IconButton
          onClick={handleCollapse}
          size="small"
          aria-label="Collapse explainer"
          sx={{ position: 'absolute', top: 4, right: 4 }}
        >
          <X size={16} />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        bgcolor: 'action.hover',
        borderRadius: 2,
        mb: 3,
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Info size={20} style={{ flexShrink: 0, marginTop: 2 }} />
        <Box sx={{ flex: 1, pr: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            What is Grand Prix Knockout?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
            An alternative F1 championship format using real race results. The last {KNOCKOUT_RACES}{' '}
            races become the knockout: top {KNOCKOUT_QUALIFIERS} drivers advance,{' '}
            {ELIMINATIONS_PER_ROUND} are eliminated each round, and the final race crowns the Grand
            Prix Knockout Champion.
          </Typography>
          <Button
            component={RouterLink}
            to="/about"
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Full rules & format
          </Button>
        </Box>
      </Box>
      <IconButton
        onClick={handleCollapse}
        size="small"
        aria-label="Collapse explainer"
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <X size={18} />
      </IconButton>
    </Box>
  );
}
