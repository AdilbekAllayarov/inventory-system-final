import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaFileExport, FaFileImport } from 'react-icons/fa';
import { CURRENCY_SYMBOL } from '../config/constants';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../services/api';

const Products = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('products.confirm_delete'))) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const getStockBadgeClass = (stock) => {
    if (stock < 10) return 'danger';
    if (stock < 50) return 'warning';
    return 'success';
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/products/export/csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setAlert({ type: 'success', message: 'CSV exported successfully' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      setAlert({ type: 'danger', message: 'Failed to export CSV' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/products/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAlert({ 
        type: 'success', 
        message: t('products.import_success', { count: response.data.imported })
      });
      setTimeout(() => setAlert(null), 3000);
      
      fetchProducts();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to import CSV:', error);
      setAlert({ type: 'danger', message: t('products.import_error') });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Navbar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      <Container fluid>
        <Row>
          <Col lg={2} className="p-0">
            <Sidebar show={menuOpen} handleClose={() => setMenuOpen(false)} />
          </Col>
          <Col lg={10} className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 header-actions">
              <h2 className="mb-0">{t('products.title')}</h2>
              <div className="d-flex gap-2 action-buttons">
                <Button variant="success" onClick={handleExportCSV}>
                  <FaFileExport className="me-2" />
                  {t('products.export_csv')}
                </Button>
                <Button 
                  variant="info" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaFileImport className="me-2" />
                  {t('products.import_csv')}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleImportCSV}
                />
                <Link to="/products/add">
                  <Button variant="primary">
                    <FaPlus className="me-2" />
                    {t('products.add_product')}
                  </Button>
                </Link>
              </div>
            </div>

            {alert && (
              <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
                {alert.message}
              </Alert>
            )}

            <Card>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder={t('products.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">{t('products.all_categories')}</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t('products.name')}</th>
                      <th>{t('products.category')}</th>
                      <th>{t('products.price')}</th>
                      <th>{t('products.stock')}</th>
                      <th>{t('products.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{CURRENCY_SYMBOL}{product.price.toFixed(2)}</td>
                        <td>
                          <Badge bg={getStockBadgeClass(product.stock)}>
                            {product.stock}
                          </Badge>
                        </td>
                        <td>
                          <Link to={`/products/edit/${product.id}`}>
                            <Button variant="warning" size="sm" className="me-2">
                              <FaEdit />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Products;
