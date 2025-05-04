import { Box, Container, Divider, Stack, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f8fafc',
        color: '#475569',
        py: 4,
        mt: 'auto',
        borderTop: '1px solid #e2e8f0'
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            mb: 3
          }}
        >
          <Box sx={{ mb: { xs: 3, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', letterSpacing: '0.5px', mb: 1 }}>
              AADF
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: '280px', color: '#64748b' }}>
              Streamlining the tender process worldwide
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={4} sx={{ mb: { xs: 3, md: 0 } }}>
            <Stack spacing={1.5}>
              <Link href="/" underline="none" color="inherit" sx={{ fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}>
                Home
              </Link>
              <Link href="/tenders" underline="none" color="inherit" sx={{ fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}>
                Tenders
              </Link>
            </Stack>
            <Stack spacing={1.5}>
              <Link href="/about" underline="none" color="inherit" sx={{ fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}>
                About
              </Link>
              <Link href="/contact" underline="none" color="inherit" sx={{ fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}>
                Contact
              </Link>
            </Stack>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map((Icon, index) => (
              <IconButton 
                key={index}
                size="small"
                sx={{ 
                  color: '#64748b',
                  '&:hover': { 
                    color: 'primary.main',
                    backgroundColor: 'rgba(59, 130, 246, 0.04)'
                  }
                }}
              >
                <Icon fontSize="small" />
              </IconButton>
            ))}
          </Stack>
        </Box>
        
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        
        <Box sx={{ pt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', mb: { xs: 1, sm: 0 } }}>
            © {new Date().getFullYear()} Tender App. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 