import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Button,
} from '@mui/material';

const FilterSidebar = ({ filters, setFilters, allTags, allCategories }) => {
  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    const newTags = checked
      ? [...filters.tags, value]
      : filters.tags.filter((tag) => tag !== value);
    setFilters({ ...filters, tags: newTags });
  };

  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
  };

  const handlePriceChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Paper sx={{ p: 3, height: 'fit-content' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h6' sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        <Button 
          size="small" 
          onClick={() => setFilters({ sortBy: 'newest', tags: [], category: '', price_min: '', price_max: '' })}
          sx={{ minWidth: 'auto' }}
        >
          Clear All
        </Button>
      </Box>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id='sort-by-label'>Sort By</InputLabel>
        <Select
          labelId='sort-by-label'
          id='sort'
          value={filters.sortBy}
          label='Sort By'
          onChange={handleSortChange}
        >
          <MenuItem value='newest'>Newest</MenuItem>
          <MenuItem value='price_asc'>Price: Low to High</MenuItem>
          <MenuItem value='price_desc'>Price: High to Low</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mb: 4 }}>
        <Typography gutterBottom variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Price Range</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type='number'
            name='price_min'
            label='Min'
            value={filters.price_min}
            onChange={handlePriceChange}
            fullWidth
            size="small"
          />
          <TextField
            type='number'
            name='price_max'
            label='Max'
            value={filters.price_max}
            onChange={handlePriceChange}
            fullWidth
            size="small"
          />
        </Box>
      </Box>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id='category-label'>Category</InputLabel>
        <Select
          labelId='category-label'
          value={filters.category}
          label='Category'
          onChange={handleCategoryChange}
        >
          <MenuItem value=''>All Categories</MenuItem>
          {allCategories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Typography gutterBottom variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Tags</Typography>
        <FormGroup sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
          {allTags.map((tag) => (
            <FormControlLabel
              key={tag}
              control={
                <Checkbox
                  value={tag}
                  checked={filters.tags.includes(tag)}
                  onChange={handleTagChange}
                  size="small"
                />
              }
              label={<Typography variant="body2">{tag}</Typography>}
              sx={{ mb: 0.5 }}
            />
          ))}
        </FormGroup>
      </Box>
    </Paper>
  );
};

export default FilterSidebar;
