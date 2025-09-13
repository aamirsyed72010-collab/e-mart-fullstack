import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Button,
} from '@mui/material';
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
          <Grid item xs={12} sm={4}>
            <Typography variant='h6' color='text.primary' gutterBottom>
              Customize
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Your ultimate destination for cutting-edge electronics and smart
              gadgets. Discover tomorrow's tech, today.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
            <Typography variant='h6' color='text.primary' gutterBottom>
              Connect
            </Typography>
            <Box>
              <IconButton
                aria-label='github'
                color='inherit'
                component='a'
                href='https://github.com'
                target='_blank'
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                aria-label='linkedin'
                color='inherit'
                component='a'
                href='https://linkedin.com'
                target='_blank'
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                aria-label='twitter'
                color='inherit'
                component='a'
                href='https://twitter.com'
                target='_blank'
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                aria-label='instagram'
                color='inherit'
                component='a'
                href='https://instagram.com/aamirsyed72010'
                target='_blank'
              >
                <InstagramIcon />
              </IconButton>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Email:
              <Button
                variant='text'
                onClick={() => setIsModalOpen(true)}
                sx={{ ml: 0.5 }}
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
