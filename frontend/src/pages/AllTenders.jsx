import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  useTheme,
  Chip,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';
import ClearIcon from '@mui/icons-material/Clear';
import tenderService from '../services/tenderService';
import TenderCard from '../components/TenderCard';

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AllTenders = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Parse page from URL or default to 1
  const initialPage = parseInt(queryParams.get('page') || '1', 10);
  const initialSearch = queryParams.get('search') || '';
  
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [searchInputValue, setSearchInputValue] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Apply debounce to search input
  const debouncedSearchTerm = useDebounce(searchInputValue, 500);

  // Update search term when debounced value changes
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
    
    // Update URL with debounced search term
    const newQueryParams = new URLSearchParams(location.search);
    if (debouncedSearchTerm) {
      newQueryParams.set('search', debouncedSearchTerm);
    } else {
      newQueryParams.delete('search');
    }
    // Only update URL if search term has changed
    if (debouncedSearchTerm !== searchTerm) {
      newQueryParams.set('page', '1');
      setPage(1);
      navigate({
        pathname: location.pathname,
        search: newQueryParams.toString()
      }, { replace: true });
    }
  }, [debouncedSearchTerm, location.pathname, navigate]);

  // Handle pagination change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Update URL with new page number
    const newQueryParams = new URLSearchParams(location.search);
    newQueryParams.set('page', newPage.toString());
    navigate({
      pathname: location.pathname,
      search: newQueryParams.toString()
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchInputValue(e.target.value);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchInputValue('');
  };

  // Fetch tenders from API
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true);
        
        // Create filter options
        const filterOptions = {
          page,
          limit: 9, // 9 tenders per page (3x3 grid)
          status: statusFilter !== 'all' ? statusFilter : undefined,
          searchTerm: searchTerm || undefined,
          sort: sortBy
        };
        
        console.log('Filtering with options:', filterOptions);
        
        const response = await tenderService.filterTenders(filterOptions);
        
        console.log('Search response:', response);
        
        if (response.success && response.data) {
          setTenders(response.data.tenders || []);
          setTotalPages(response.data.pages || 1);
        } else {
          throw new Error('Invalid response format');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tenders:', error);
        setError('Failed to load tenders. Please try again later.');
        setLoading(false);
      }
    };

    fetchTenders();
  }, [page, statusFilter, sortBy, searchTerm]);

  const clearFilters = () => {
    setSearchInputValue('');
    setStatusFilter('all');
    setSortBy('newest');
    setPage(1);
    navigate(location.pathname);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || sortBy !== 'newest';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? '#fff' : '#333',
            position: 'relative',
            display: 'inline-block',
            mb: 3,
            '&:after': {
              content: '""',
              position: 'absolute',
              width: '60%',
              height: '4px',
              bottom: '-8px',
              left: 0,
              background: 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)',
              borderRadius: '2px'
            }
          }}
        >
          All Tenders
        </Typography>
        
        <Box component="div" sx={{ width: '100%', mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search tenders..."
                value={searchInputValue}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchInputValue && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
              {loading && debouncedSearchTerm !== searchTerm && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Searching...
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All statuses</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="sort-label">Sort by</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                  startAdornment={<SortIcon sx={{ mr: 1 }} />}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="newest">Newest first</MenuItem>
                  <MenuItem value="oldest">Oldest first</MenuItem>
                  <MenuItem value="deadline">Deadline (soonest)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {hasActiveFilters && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <TuneIcon fontSize="small" sx={{ mr: 0.5 }} /> Active filters:
                  </Typography>
                  
                  {searchTerm && (
                    <Chip 
                      label={`Search: ${searchTerm}`} 
                      size="small" 
                      onDelete={handleClearSearch}
                      sx={{ borderRadius: 1.5, mr: 1 }}
                    />
                  )}
                  
                  {statusFilter !== 'all' && (
                    <Chip 
                      label={`Status: ${statusFilter}`} 
                      size="small" 
                      onDelete={() => setStatusFilter('all')}
                      sx={{ borderRadius: 1.5, mr: 1 }}
                    />
                  )}
                  
                  {sortBy !== 'newest' && (
                    <Chip 
                      label={`Sort: ${sortBy === 'oldest' ? 'Oldest first' : 'Deadline (soonest)'}`} 
                      size="small" 
                      onDelete={() => setSortBy('newest')}
                      sx={{ borderRadius: 1.5, mr: 1 }}
                    />
                  )}
                  
                  <Chip 
                    label="Clear All" 
                    color="error" 
                    size="small" 
                    onClick={clearFilters}
                    sx={{ borderRadius: 1.5 }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading && !error && tenders.length === 0 && (
        <Paper sx={{ textAlign: 'center', p: 5, borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tenders available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria or check back later for new opportunities
          </Typography>
        </Paper>
      )}
      
      {/* Tenders grid */}
      {!loading && tenders.length > 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 3,
            width: '100%'
          }}
        >
          {tenders.map((tender) => (
            <Box
              key={tender._id || tender.id}
              sx={{
                width: {
                  xs: '100%',              // 1 card per row on mobile
                  sm: 'calc(50% - 16px)',  // 2 cards per row on tablet, accounting for gap
                  md: 'calc(33.33% - 16px)' // 3 cards per row on desktop, accounting for gap
                },
                display: 'flex',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/tenders/${tender._id || tender.id}`)}
            >
              <TenderCard tender={tender} />
            </Box>
          ))}
        </Box>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Stack spacing={2} sx={{ my: 4, display: 'flex', alignItems: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1.5,
              }
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
        </Stack>
      )}
    </Container>
  );
};

export default AllTenders; 