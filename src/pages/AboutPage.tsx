import { Box, Container, Typography, Divider, Link } from '@mui/material';
import { ExternalLink, Github } from 'lucide-react';

import { TiebreakerExplainer } from 'src/components/common';
import {
  KNOCKOUT_RACES,
  KNOCKOUT_QUALIFIERS,
  RACE_POINTS,
  SPRINT_POINTS,
  RACES_PER_ROUND,
  KNOCKOUT_ROUNDS,
  LAST_FASTEST_LAP_BONUS_SEASON,
} from 'src/constants';

export function AboutPage(): React.ReactElement {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          About Grand Prix Knockout
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
          An independent, fan made, reimagining of the Formula 1 World Drivers' Championship. We
          take real race results and apply a season-long knockout, the way F1's own qualifying
          knocks drivers out session by session.
        </Typography>

        {/* Philosophy */}
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          The Philosophy
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
          F1 titles are often decided before the final race. 2020 was sealed in Turkey with 3 races
          left. 2022 in Japan with 4 races left. 2023 in Qatar with 5 races left. Even 2025, which
          went to Abu Dhabi, saw Norris win the title despite Verstappen winning the final race.
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
          The 2021 finale, Verstappen vs Hamilton, tied on points for the final race was magic. But
          it almost never happens.
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
          Grand Prix Knockout asks: what if the finale genuinely mattered every single year? This is
          a parallel universe, not a replacement.
        </Typography>

        <Divider sx={{ my: 4 }} />

        {/* Format */}
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          The Format
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
          The last {KNOCKOUT_RACES} races of the season become the knockout. Everything before is
          the regular season.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Regular Season
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top {KNOCKOUT_QUALIFIERS} advance to the knockout
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Round 1 ({RACES_PER_ROUND} races)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {KNOCKOUT_ROUNDS[0].startDrivers} → {KNOCKOUT_ROUNDS[0].endDrivers} drivers
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Round 2 ({RACES_PER_ROUND} races)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {KNOCKOUT_ROUNDS[1].startDrivers} → {KNOCKOUT_ROUNDS[1].endDrivers} drivers
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              Round 3 ({RACES_PER_ROUND} races)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {KNOCKOUT_ROUNDS[2].startDrivers} → {KNOCKOUT_ROUNDS[2].endDrivers} drivers
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Final ({KNOCKOUT_ROUNDS[3].races} race)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Winner crowned Grand Prix Knockout Champion
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Points */}
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          Points System
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
          Standard F1 points are used. Points reset to zero at the start of each knockout round. The
          site shows both knockout standings and official F1 points side-by-side, so you get both
          perspectives.
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Race Points (Top 10)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {RACE_POINTS.map((pts, i) => `P${i + 1}: ${pts}`).join(' • ')}
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Sprint Points (Top 8)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {SPRINT_POINTS.map((pts, i) => `P${i + 1}: ${pts}`).join(' • ')}
        </Typography>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Bonus Points (2020–{LAST_FASTEST_LAP_BONUS_SEASON} seasons)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fastest Lap: 1 pt (if finished top 10). This bonus was removed from the{' '}
          {LAST_FASTEST_LAP_BONUS_SEASON + 1} season onwards.
        </Typography>

        <Divider sx={{ my: 4 }} />

        {/* Tiebreakers */}
        <TiebreakerExplainer />

        <Divider sx={{ my: 4 }} />

        {/* Final Standings */}
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          Final Standings
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
          Eliminated drivers continue racing and accumulating points to determine their final
          position within their bracket:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            • <strong>1st–4th:</strong> Final race is winner-take-all, remaining finalists ranked by
            final race points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>5th–6th:</strong> Ranked by Round 3 + Final points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>7th–8th:</strong> Ranked by Round 2 + Round 3 + Final points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>9th–10th:</strong> Ranked by Round 1 + Round 2 + Round 3 + Final points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>11th+:</strong> Ranked by Regular Season + all Knockout points
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Links */}
        <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
          Project
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
          <Link
            href="https://github.com/nickarrow/grand-prix-playoffs"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Github size={16} />
            View on GitHub
            <ExternalLink size={12} />
          </Link>
        </Box>

        {/* Disclaimer */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, lineHeight: 1.6 }}>
          Grand Prix Knockout is an independent fan project. It is not affiliated with, endorsed by,
          or associated with Formula One Group, the FIA, or Formula 1. All F1-related trademarks
          belong to their respective owners.
        </Typography>
      </Box>
    </Container>
  );
}
