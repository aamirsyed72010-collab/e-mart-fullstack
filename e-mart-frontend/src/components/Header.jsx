import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Button,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { styled, alpha, useTheme as useThemeMui } from '@mui/material/styles';
import {
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  Logout as LogoutIcon,
  Build as BuildIcon,
  WbSunny as WbSunnyIcon,
  Brightness4 as Brightness4Icon,
  Settings as SettingsIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import {
  useScroll,
  useMotionValueEvent,
  motion,
  useAnimation,
} from 'framer-motion';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.15)
      : alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.common.white, 0.25)
        : alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Header = () => {
  const { cartCount, itemAdded } = useCart();
  const { themeMode, toggleTheme } = useTheme();
  const { wishlistCount } = useWishlist();
  const { comparisonCount } = useComparison();
  const { user, loading, login, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const themeMui = useThemeMui();
  const controls = useAnimation();

  useEffect(() => {
    if (itemAdded) {
      controls.start({
        scale: [1, 1.3, 1],
        rotate: [0, -15, 15, -15, 0],
        transition: { duration: 0.5 },
      });
    }
  }, [itemAdded, controls]);

  useEffect(() => {
    const today = new Date();
    const curHr = today.getHours();

    if (curHr < 12) {
      setGreeting('Good morning');
    } else if (curHr < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      setSearchQuery('');
    }
  };

  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchor(null);
  };

  const renderAuthContent = () => {
    if (loading) {
      return <CircularProgress color='inherit' size={24} />;
    } else if (user) {
      return (
        <>
          {user.role === 'seller' && (
            <IconButton
              component={RouterLink}
              to='/seller/dashboard'
              title='Seller Dashboard'
              color='inherit'
            >
              <BuildIcon />
            </IconButton>
          )}
          {user.role === 'admin' && (
            <>
              <IconButton
                onClick={handleAdminMenuOpen}
                title='Admin Settings'
                color='inherit'
              >
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={adminMenuAnchor}
                open={Boolean(adminMenuAnchor)}
                onClose={handleAdminMenuClose}
              >
                <MenuItem
                  component={RouterLink}
                  to='/admin/seller-requests'
                  onClick={handleAdminMenuClose}
                >
                  Seller Requests
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to='/admin/users'
                  onClick={handleAdminMenuClose}
                >
                  Manage Users
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to='/admin/products'
                  onClick={handleAdminMenuClose}
                >
                  Manage Products
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to='/admin/reviews'
                  onClick={handleAdminMenuClose}
                >
                  Manage Reviews
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to='/admin/admin-requests'
                  onClick={handleAdminMenuClose}
                >
                  Manage Admin Requests
                </MenuItem>
              </Menu>
            </>
          )}
          <IconButton
            component={RouterLink}
            to='/account'
            title='My Account'
            color='inherit'
          >
            {user.profilePicture ? (
              <Avatar
                src={user.profilePicture}
                sx={{ width: 24, height: 24 }}
              />
            ) : (
              <AccountCircleIcon />
            )}
          </IconButton>
          <Typography
            variant='body2'
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            {user.displayName}
          </Typography>
          <IconButton onClick={handleLogout} title='Logout' color='inherit'>
            <LogoutIcon />
          </IconButton>
        </>
      );
    } else {
      return (
        <Button
          onClick={login}
          title='Sign In with Google'
          variant='contained'
          color='primary'
          startIcon={<GoogleIcon />}
        >
          Sign In
        </Button>
      );
    }
  };

  return (
    <AppBar
      position='sticky'
      enableColorOnDark
      sx={{
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        backgroundColor: alpha(
          themeMui.palette.background.paper,
          scrolled ? 0.85 : 1
        ),
        borderBottom: `1px solid ${scrolled ? themeMui.palette.divider : 'transparent'}`,
        transition:
          'background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <Toolbar>
        <Typography
          variant='h6'
          noWrap
          component={RouterLink}
          to='/'
          sx={{
            mr: 2,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Customize
        </Typography>

        <Typography
          variant='body1'
          sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}
        >
          {greeting}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <form onSubmit={handleSearchSubmit}>
            <StyledInputBase
              placeholder='Search…'
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={toggleTheme}
            title={
              themeMode === 'dark'
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode'
            }
            color='inherit'
          >
            {themeMode === 'dark' ? <WbSunnyIcon /> : <Brightness4Icon />}
          </IconButton>

          {renderAuthContent()}

          <IconButton
            component={RouterLink}
            to='/compare'
            title='Compare Products'
            color='inherit'
          >
            <Badge badgeContent={comparisonCount} color='secondary'>
              <ViewColumnIcon />
            </Badge>
          </IconButton>
          <IconButton
            component={RouterLink}
            to='/wishlist'
            title='My Wishlist'
            color='inherit'
          >
            <Badge badgeContent={wishlistCount} color='secondary'>
              <FavoriteBorderIcon />
            </Badge>
          </IconButton>
          <motion.div animate={controls}>
            <IconButton
              component={RouterLink}
              to='/cart'
              title='My Cart'
              color='inherit'
            >
              <Badge badgeContent={cartCount} color='secondary'>
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
