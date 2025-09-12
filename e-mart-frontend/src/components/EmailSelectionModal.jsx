import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Mail as MailIcon } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';

const EmailSelectionModal = ({ isOpen, onClose, recipientEmail, subject, body }) => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodedSubject}&body=${encodedBody}`;
  const outlookUrl = `https://outlook.live.com/owa/?rfr=0&amp;url=https%3A%2F%2Foutlook.live.com%2Fowa%2F%3Fpath%3D%2Fmail%2Faction%2Fcompose&to=${recipientEmail}&subject=${encodedSubject}&body=${encodedBody}`;
  const yahooUrl = `https://mail.yahoo.com/d/compose?to=${recipientEmail}&subject=${encodedSubject}&body=${encodedBody}`;
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Choose your Email Provider</DialogTitle>
      <DialogContent>
        <List>
          <ListItem disablePadding>
            <ListItemButton component="a" href={gmailUrl} target="_blank" rel="noopener noreferrer" onClick={onClose}>
              <ListItemIcon>
                <GoogleIcon />
              </ListItemIcon>
              <ListItemText primary="Open with Gmail" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href={outlookUrl} target="_blank" rel="noopener noreferrer" onClick={onClose}>
              <ListItemText primary="Open with Outlook" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href={yahooUrl} target="_blank" rel="noopener noreferrer" onClick={onClose}>
              <ListItemText primary="Open with Yahoo Mail" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href={mailtoUrl} onClick={onClose}>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Use Default Email Client" />
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailSelectionModal;