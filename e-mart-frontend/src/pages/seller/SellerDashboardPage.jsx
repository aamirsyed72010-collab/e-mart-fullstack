import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from 'components/LoadingSpinner';
import SellerAnalytics from 'components/SellerAnalytics';
import { allTags, allCategories } from 'constants/productConstants';
import {
  fetchSellerProducts,
  fetchAnalytics,
  addProduct,
  updateProduct,
  deleteProduct,
} from 'services/api';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Modal,
  Alert,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const SellerDashboardPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: '',
    tags: [],
    category: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadSellerProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await fetchSellerProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch seller products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    loadSellerProducts();
    loadAnalytics();
  }, [loadSellerProducts, loadAnalytics]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const formState = isModalOpen ? setEditingProduct : setFormData;
    const currentData = isModalOpen ? editingProduct : formData;

    if (name === 'tags') {
      formState((prevData) => {
        const newTags = checked
          ? [...prevData.tags, value]
          : prevData.tags.filter((tag) => tag !== value);
        return { ...prevData, tags: newTags };
      });
    } else {
      formState({ ...currentData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.imageUrl ||
      !formData.stock ||
      !formData.category ||
      formData.tags.length === 0
    ) {
      setError(
        'Please fill in all product fields, including category, stock and at least one tag.'
      );
      return;
    }
    try {
      const data = await addProduct(formData);
      setMessage(`Product "${data.name}" added successfully!`);
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        stock: '',
        tags: [],
        category: '',
      });
      loadSellerProducts();
      loadAnalytics();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProduct(editingProduct._id, editingProduct);
      setMessage('Product updated successfully!');
      setIsModalOpen(false);
      setEditingProduct(null);
      loadSellerProducts();
      loadAnalytics();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setMessage('Product deleted successfully.');
        loadSellerProducts();
        loadAnalytics();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const renderProductForm = (data, handler, isEdit = false) => (
    <Box component='form' onSubmit={isEdit ? handleUpdate : handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Product Name'
            name='name'
            value={data.name}
            onChange={handler}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Description'
            name='description'
            value={data.description}
            onChange={handler}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type='number'
            label='Price'
            name='price'
            value={data.price}
            onChange={handler}
            required
            inputProps={{ step: '0.01' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type='number'
            label='Stock Quantity'
            name='stock'
            value={data.stock}
            onChange={handler}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type='url'
            label='Image URL'
            name='imageUrl'
            value={data.imageUrl}
            onChange={handler}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              name='category'
              value={data.category}
              label='Category'
              onChange={handler}
            >
              {allCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography>Tags</Typography>
          <FormGroup row>
            {allTags.map((tag) => (
              <FormControlLabel
                key={tag}
                control={
                  <Checkbox
                    name='tags'
                    value={tag}
                    checked={data.tags.includes(tag)}
                    onChange={handler}
                  />
                }
                label={tag}
              />
            ))}
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <Button type='submit' variant='contained' fullWidth>
            {isEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom align='center'>
        Seller Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant='h5' gutterBottom>
          Your Analytics
        </Typography>
        {loadingAnalytics ? (
          <LoadingSpinner />
        ) : (
          <SellerAnalytics analytics={analytics} />
        )}
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h5' gutterBottom>
              Add a New Product
            </Typography>
            {message && (
              <Alert severity='success' sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {renderProductForm(formData, handleChange)}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h5' gutterBottom>
              Your Products
            </Typography>
            {loadingProducts ? (
              <LoadingSpinner />
            ) : (
              <List>
                {products.map((p) => (
                  <ListItem
                    key={p._id}
                    secondaryAction={
                      <>
                        <IconButton
                          edge='end'
                          aria-label='edit'
                          onClick={() => openEditModal(p)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          edge='end'
                          aria-label='delete'
                          onClick={() => handleDelete(p._id)}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={p.imageUrl} alt={p.name} variant='square' />
                    </ListItemAvatar>
                    <ListItemText
                      primary={p.name}
                      secondary={`Stock: ${p.stock}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Modal open={isModalOpen} onClose={closeEditModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' component='h2' gutterBottom>
            Edit Product
          </Typography>
          {editingProduct &&
            renderProductForm(editingProduct, handleChange, true)}
        </Box>
      </Modal>
    </Container>
  );
};

export default SellerDashboardPage;
