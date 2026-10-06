import { useState } from 'react';

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  ListSubheader,
} from '@mui/material';
import { Menu as MenuIcon, Sun, Moon, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useThemeStore } from 'src/store';
import { CURRENT_SEASON, HISTORICAL_SEASONS } from 'src/constants';

export function Header(): React.ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [seasonAnchor, setSeasonAnchor] = useState<null | HTMLElement>(null);
  const { mode, toggleMode } = useThemeStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const seasonMenuOpen = Boolean(seasonAnchor);

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  const handleSeasonMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setSeasonAnchor(event.currentTarget);
  };

  const handleSeasonMenuClose = (): void => {
    setSeasonAnchor(null);
  };

  const handleSeasonSelect = (year: number): void => {
    navigate(`/${year}`);
    handleSeasonMenuClose();
    setMobileOpen(false);
  };

  const isSeasonPage = location.pathname.match(/^\/\d{4}$/);
  const currentPageYear = isSeasonPage ? parseInt(location.pathname.slice(1), 10) : null;

  // Mobile drawer content
  const drawer = (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        GPP
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/"
            selected={location.pathname === '/'}
            onClick={handleDrawerToggle}
            sx={{ textAlign: 'center' }}
          >
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>

        {/* All Seasons - current first, then historical in reverse order */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleSeasonSelect(CURRENT_SEASON)}
            selected={currentPageYear === CURRENT_SEASON}
            sx={{ textAlign: 'center' }}
          >
            <ListItemText primary={CURRENT_SEASON} />
          </ListItemButton>
        </ListItem>
        {[...HISTORICAL_SEASONS].reverse().map((year) => (
          <ListItem key={year} disablePadding>
            <ListItemButton
              onClick={() => handleSeasonSelect(year)}
              selected={currentPageYear === year}
              sx={{ textAlign: 'center', py: 0.75 }}
            >
              <ListItemText primary={year} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/about"
            selected={location.pathname === '/about'}
            onClick={handleDrawerToggle}
            sx={{ textAlign: 'center' }}
          >
            <ListItemText primary="About" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open navigation menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon size={24} />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Grand Prix Playoffs
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
              <Typography
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === '/' ? 600 : 400,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                Home
              </Typography>

              {/* Seasons Dropdown */}
              <Box
                component="button"
                type="button"
                id="season-button"
                onClick={handleSeasonMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  p: 0,
                  font: 'inherit',
                  color: isSeasonPage ? 'primary.main' : 'text.primary',
                  fontWeight: isSeasonPage ? 600 : 400,
                  '&:hover': { color: 'primary.main' },
                }}
                aria-controls={seasonMenuOpen ? 'season-menu' : undefined}
                aria-haspopup="menu"
                aria-expanded={seasonMenuOpen}
              >
                <Typography component="span" sx={{ fontWeight: 'inherit', color: 'inherit' }}>
                  {currentPageYear ? `${currentPageYear} Season` : 'Seasons'}
                </Typography>
                <ChevronDown size={18} style={{ marginLeft: 4 }} />
              </Box>

              <Menu
                id="season-menu"
                anchorEl={seasonAnchor}
                open={seasonMenuOpen}
                onClose={handleSeasonMenuClose}
                slotProps={{ list: { 'aria-labelledby': 'season-button' } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem
                  onClick={() => handleSeasonSelect(CURRENT_SEASON)}
                  selected={currentPageYear === CURRENT_SEASON}
                  sx={{ fontWeight: currentPageYear === CURRENT_SEASON ? 600 : 400 }}
                >
                  {CURRENT_SEASON} Season (Current)
                </MenuItem>
                <Divider />
                <ListSubheader sx={{ lineHeight: 2 }}>Past Seasons</ListSubheader>
                {[...HISTORICAL_SEASONS].reverse().map((year) => (
                  <MenuItem
                    key={year}
                    onClick={() => handleSeasonSelect(year)}
                    selected={currentPageYear === year}
                    sx={{ fontWeight: currentPageYear === year ? 600 : 400 }}
                  >
                    {year}
                  </MenuItem>
                ))}
              </Menu>

              <Typography
                component={Link}
                to="/about"
                sx={{
                  textDecoration: 'none',
                  color: location.pathname === '/about' ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === '/about' ? 600 : 400,
                  '&:hover': { color: 'primary.main' },
                }}
              >
                About
              </Typography>
            </Box>
          )}

          <IconButton
            color="inherit"
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          >
            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
