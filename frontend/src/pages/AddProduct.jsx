import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const AddProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/products', {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      navigate('/products');
    } catch (err) {
      setError(t('add_product.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      <Container fluid>
        <Row>
          <Col lg={2} className="p-0">
            <Sidebar show={menuOpen} handleClose={() => setMenuOpen(false)} />
          </Col>
          <Col lg={10} className="main-content p-4">
            <h2 className="mb-4">{t('add_product.title')}</h2>

            <Card>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('add_product.name')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('add_product.category')}</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('add_product.price')}</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('add_product.stock')}</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? t('common.loading') : t('add_product.submit')}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/products')}
                    >
                      {t('add_product.cancel')}
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

export default AddProduct;
