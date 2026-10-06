// The Tiebreakers section of the About page, extracted so the page stays within
// its ~200-line target. It describes the rule exactly as the engine applies it
// (src/engine/standings.ts, compareTiebreaker), settled in
// docs/decisions/0004-tiebreak-countback-then-regular-season.md.

import { Box, Typography } from '@mui/material';

export function TiebreakerExplainer(): React.ReactElement {
  return (
    <>
      <Typography variant="h5" component="h2" fontWeight={600} gutterBottom>
        Tiebreakers
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
        When drivers finish a round level on points, they are separated by a countback over that
        round&apos;s races, the same idea F1 uses to settle a championship tie. Whoever has more
        wins ranks higher. If that is level too, it comes down to who has more second places, then
        more thirds, and on down through every finishing position until one driver comes out ahead.
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
        A few details, so the order is never left to chance:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          • <strong>Every classified place counts.</strong> The countback does not stop at the
          points positions. It runs the whole field, and a driver who was classified at the finish
          keeps that place even if they retired late.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>Only the round&apos;s races.</strong> A round&apos;s countback looks at that
          round&apos;s races alone, because that is where its points came from.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>Sprints do not count.</strong> Sprint points still add to a round&apos;s total,
          but sprint finishes are left out of the countback, following F1&apos;s own wording of
          places &quot;in a race&quot;.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • <strong>Still level?</strong> The driver who finished the regular season higher ranks
          ahead. In the rare case two drivers tied there as well, the official F1 championship order
          after the last regular-season race settles it, so a result never rests on anything
          unpublished.
        </Typography>
      </Box>
    </>
  );
}
