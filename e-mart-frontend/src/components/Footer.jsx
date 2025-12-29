import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Button,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';
import { Link as RouterLink } from 'react-router-dom';
import {
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import EmailSelectionModal from './EmailSelectionModal';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Box
      component='footer'
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 8,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={4} justifyContent='space-evenly'>
          <Grid xs={12} sm={4}>
            <Typography variant='h6' color='text.primary' gutterBottom>
              Customize
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Your ultimate destination for cutting-edge electronics and smart
              gadgets. Discover tomorrow's tech, today.
            </Typography>
          </Grid>
          <Grid xs={12} sm={4}>
            <Typography variant='h6' color='text.primary' gutterBottom>
              Quick Links
            </Typography>
            <Link
              component={RouterLink}
              to='/'
              display='block'
              variant='body2'
              color='text.secondary'
            >
              Home
            </Link>
            <Link
              component={RouterLink}
              to='/cart'
              display='block'
              variant='body2'
              color='text.secondary'
            >
              Cart
            </Link>
            <Link
              component={RouterLink}
              to='/account'
              display='block'
              variant='body2'
              color='text.secondary'
            >
              Account
            </Link>
            <Link
              component={RouterLink}
              to='/seller/dashboard'
              display='block'
              variant='body2'
              color='text.secondary'
            >
              Seller Dashboard
            </Link>
          </Grid>
          <Grid xs={12} sm={4}>
            <Typography variant='h6' color='text.primary' gutterBottom sx={{ fontWeight: 600 }}>
              Stay Updated
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              Subscribe to our newsletter for the latest tech news and exclusive offers.
            </Typography>
            <Box component="form" sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  flexGrow: 1,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <Button variant="contained" size="small" sx={{ minWidth: 'auto' }}>
                Subscribe
              </Button>
            </Box>
            <Typography variant='h6' color='text.primary' gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              Connect
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                aria-label='github'
                color='inherit'
                component='a'
                href='https://github.com'
                target='_blank'
                sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', color: 'primary.main' } }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                aria-label='linkedin'
                color='inherit'
                component='a'
                href='https://linkedin.com'
                target='_blank'
                sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', color: '#0077b5' } }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                aria-label='twitter'
                color='inherit'
                component='a'
                href='https://twitter.com'
                target='_blank'
                sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', color: '#1DA1F2' } }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                aria-label='instagram'
                color='inherit'
                component='a'
                href='https://instagram.com/aamirsyed72010'
                target='_blank'
                sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', color: '#E1306C' } }}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              Email:
              <Button
                variant='text'
                onClick={() => setIsModalOpen(true)}
                sx={{ ml: 0.5, textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                aamirsyed72010@gmail.com
              </Button>
            </Typography>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant='body2' color='text.secondary' align='center'>
            {'© '}
            {new Date().getFullYear()}
            {' Customize. All Rights Reserved.'}
          </Typography>
        </Box>
      </Container>
      <EmailSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipientEmail='aamirsyed72010@gmail.com'
        subject='Inquiry from E-Mart Website'
        body='Dear E-Mart Team,'
      />
    </Box>
  );
};

export default Footer;
