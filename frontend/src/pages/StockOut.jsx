import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../services/api';

const StockOut = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError(t('stock_out.error'));
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setQuantity('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedProduct.stock < parseInt(quantity)) {
      setError(t('stock_out.insufficient'));
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/products/${selectedProduct.id}/stock-out`, {
        quantity: parseInt(quantity)
      });
      setSuccess(t('stock_out.success'));
      setQuantity('');
      fetchProducts();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || t('stock_out.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getNewStock = () => {
    if (selectedProduct && quantity) {
      return selectedProduct.stock - parseInt(quantity);
    }
    return 0;
  };

  if (loading) return <Loader />;

  return (
    <div>
      <Navbar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      <Container fluid>
        <Row>
          <Col lg={2} className="p-0">
            <Sidebar show={menuOpen} handleClose={() => setMenuOpen(false)} />
          </Col>
          <Col lg={10} className="main-content p-4">
            <h2 className="mb-4">{t('stock_out.title')}</h2>

            <Card>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('stock_out.select_product')}</Form.Label>
                    <Form.Select
                      onChange={handleProductChange}
                      required
                    >
                      <option value="">{t('stock_out.select_product')}</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {t('stock_out.current_stock')}: {product.stock}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {selectedProduct && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('stock_out.quantity')}</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max={selectedProduct.stock}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                      </Form.Group>

                      <div className="alert alert-info">
                        <strong>{t('stock_out.current_stock')}:</strong> {selectedProduct.stock}
                        <br />
                        {quantity && (
                          <>
                            <strong>{t('stock_out.new_stock')}:</strong> {getNewStock()}
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="danger"
                      disabled={!selectedProduct || !quantity || submitting}
                    >
                      {submitting ? t('common.loading') : t('stock_out.submit')}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/dashboard')}
                    >
                      {t('stock_out.cancel')}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StockOut;
