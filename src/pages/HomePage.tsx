import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useKnockoutData } from 'src/hooks';
import { StandingsTable } from 'src/components/standings';
import { CURRENT_SEASON, HISTORICAL_SEASONS } from 'src/constants';

export function HomePage(): React.ReactElement {
  const { knockoutState, races, isLoading, error } = useKnockoutData(CURRENT_SEASON);
  const navigate = useNavigate();

  const handleSeasonChange = (event: SelectChangeEvent<string>): void => {
    const year = event.target.value;
    if (year) {
      navigate(`/${year}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        {/* Hero section */}
        <Box sx={{ mb: 4, textAlign: { xs: 'left', md: 'center' } }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}
          >
            Grand Prix Playoffs
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: 400 }}
          >
            The F1 championship, reimagined.
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: { md: 'auto' }, mb: 1.5, lineHeight: 1.7 }}
          >
            F1 titles are often decided before the final race. Grand Prix Playoffs reimagines the
            championship as a playoff where the top 10 drivers from the regular season advance to a
            7-race playoff until only 4 drivers remain for a winner-take-all finale.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <Button
              component={RouterLink}
              to="/about"
              variant="outlined"
              size="medium"
              sx={{ textTransform: 'none' }}
            >
              How it works
            </Button>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value=""
                onChange={handleSeasonChange}
                displayEmpty
                sx={{ textTransform: 'none' }}
              >
                <MenuItem value="" disabled>
                  View past season
                </MenuItem>
                {[...HISTORICAL_SEASONS].reverse().map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Current season standings */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h5" component="h2" fontWeight={600}>
              {CURRENT_SEASON} Standings
            </Typography>
            <Button
              component={RouterLink}
              to={`/${CURRENT_SEASON}`}
              endIcon={<ArrowRight size={16} />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Full details
            </Button>
          </Box>

          {isLoading && (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}

          {error && <Alert severity="error">Failed to load standings: {error.message}</Alert>}

          {!isLoading && !error && (!knockoutState || races.length === 0) && (
            <Alert severity="info">
              The {CURRENT_SEASON} season hasn't started yet. Check back once races begin!
            </Alert>
          )}

          {!isLoading && !error && knockoutState && races.length > 0 && (
            <StandingsTable knockoutState={knockoutState} allRaces={races} />
          )}
        </Paper>
      </Box>
    </Container>
  );
}
