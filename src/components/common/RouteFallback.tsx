// Suspense fallback shown while a lazily loaded page chunk is fetched

import { Box, CircularProgress } from '@mui/material';

export function RouteFallback(): React.ReactElement {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}
