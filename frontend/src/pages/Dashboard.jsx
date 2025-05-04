import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  IconButton, 
  MenuItem, 
  Menu,
  Divider,
  useTheme,
  alpha,
  Button
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  MoreVert as MoreVertIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  BarChart as BarChartIcon,
  DateRange as DateRangeIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Dummy data for monthly submissions
const monthlySubmissionsData = [
  { name: 'Jan', submissions: 12, rate: 35 },
  { name: 'Feb', submissions: 19, rate: 42 },
  { name: 'Mar', submissions: 28, rate: 58 },
  { name: 'Apr', submissions: 31, rate: 67 },
  { name: 'May', submissions: 26, rate: 51 },
  { name: 'Jun', submissions: 35, rate: 72 },
  { name: 'Jul', submissions: 20, rate: 45 },
  { name: 'Aug', submissions: 29, rate: 63 },
  { name: 'Sep', submissions: 41, rate: 78 },
  { name: 'Oct', submissions: 48, rate: 85 },
  { name: 'Nov', submissions: 33, rate: 70 },
  { name: 'Dec', submissions: 39, rate: 80 },
];

// Summary cards data
const summaryData = [
  { 
    title: 'Closed Submissions', 
    value: '245', 
    change: '+18%',
    isPositive: true,
    icon: <CheckCircleIcon />, 
    color: '#4caf50' 
  },
  { 
    title: 'Open Submissions', 
    value: '86', 
    change: '-5%',
    isPositive: false,
    icon: <HourglassEmptyIcon />, 
    color: '#ff9800' 
  },
  { 
    title: 'Total Submissions', 
    value: '331', 
    change: '+12%',
    isPositive: true,
    icon: <AssessmentIcon />, 
    color: '#2196f3' 
  },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle2">{label}</Typography>
        {payload.map((entry, index) => (
          <Typography
            key={`item-${index}`}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {entry.name === 'rate' 
              ? `${entry.value}%` 
              : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const Dashboard = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [timeRange, setTimeRange] = useState('This Year');
  const [chartType, setChartType] = useState('line');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setAnchorEl(null);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
    setAnchorEl(null);
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Dashboard Overview
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<DateRangeIcon />}
            sx={{ 
              mr: 2,
              borderRadius: '20px',
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }
            }}
          >
            {timeRange}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            sx={{ 
              borderRadius: '20px',
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              }
            }}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                border: '1px solid',
                borderColor: theme => alpha(theme.palette.divider, 0.1),
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                    borderRadius: 2,
                    color: 'white',
                    backgroundColor: item.color,
                    mr: 2,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {item.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {item.value}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: item.isPositive ? 'success.main' : 'error.main',
                bgcolor: item.isPositive ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                px: 1,
                py: 0.5,
                borderRadius: 1,
                width: 'fit-content'
              }}>
                {item.isPositive ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                <Typography variant="caption" fontWeight="medium">
                  {item.change} {timeRange.toLowerCase()}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          pt: 3.5,
          pb: 4,
          borderRadius: 3,
          width: '100%',
          border: '1px solid',
          borderColor: theme => alpha(theme.palette.divider, 0.1),
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 2.5,
          width: '100%',
          pl: 0.5
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start',
            ml: 0.5
          }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              sx={{ 
                mb: 0.5,
                fontSize: '1.25rem',
                letterSpacing: '0.5px',
                color: theme.palette.primary.main
              }}
            >
              Submission History
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                lineHeight: 1.5,
                fontSize: '0.875rem',
                opacity: 0.85
              }}
            >
              Number of submissions and acceptance rates per month
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleChartTypeChange('line')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" />
                  Line Chart
                </Box>
              </MenuItem>
              <MenuItem onClick={() => handleChartTypeChange('bar')}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon fontSize="small" />
                  Bar Chart
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleTimeRangeChange('This Year')}>
                This Year
              </MenuItem>
              <MenuItem onClick={() => handleTimeRangeChange('Last 6 Months')}>
                Last 6 Months
              </MenuItem>
              <MenuItem onClick={() => handleTimeRangeChange('Last 30 Days')}>
                Last 30 Days
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Box sx={{ height: 400, width: '100%', pl: 0.5 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart
                data={monthlySubmissionsData}
                margin={{ top: 5, right: 40, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 10']}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="submissions"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rate"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={monthlySubmissionsData}
                margin={{ top: 5, right: 40, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 10']}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="left"
                  dataKey="submissions" 
                  fill={theme.palette.primary.main} 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="rate" 
                  fill={theme.palette.secondary.main} 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard; 