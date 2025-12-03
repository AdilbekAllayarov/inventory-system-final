import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { CURRENCY_SYMBOL } from '../config/constants';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../services/api';

const Products = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader />;

  return (
    <div>
      <Navbar />
      <Container fluid>
        <Row>
          <Col md={2} className="p-0">
            <Sidebar />
          </Col>
          <Col md={10} className="main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>{t('products.title')}</h2>
              <Link to="/products/add">
                <Button variant="primary">
                  <FaPlus className="me-2" />
                  {t('products.add_product')}
                </Button>
              </Link>
            </div>

            <Card className="mb-4">
              <Card.Body>
                <Row>
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
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">{t('products.no_products')}</p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>ID</th>
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
                          <td>{product.id}</td>
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
                              <Button variant="outline-primary" size="sm" className="me-2">
                                <FaEdit />
                              </Button>
                            </Link>
                            <Button
                              variant="outline-danger"
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
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Products;
