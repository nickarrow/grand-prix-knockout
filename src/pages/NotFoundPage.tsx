import { Box, Container, Typography, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage(): React.ReactElement {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          No data for that page
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          We couldn't find anything here. The season may not be covered, or the page may not exist.{' '}
          <Link component={RouterLink} to="/">
            Head back to the standings
          </Link>
          .
        </Alert>
      </Box>
    </Container>
  );
}
