import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaBoxes, FaExclamationTriangle, FaDollarSign, FaTags } from 'react-icons/fa';
import { CURRENCY_SYMBOL } from '../config/constants';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import api from '../services/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
    categories: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/products');
      const products = response.data;

      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.stock < 10).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
      const categories = [...new Set(products.map(p => p.category))].length;

      setStats({
        totalProducts,
        lowStockItems,
        totalValue,
        categories
      });

      setRecentProducts(products.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const getStockBadgeClass = (stock) => {
    if (stock < 10) return 'low-stock';
    if (stock < 50) return 'medium-stock';
    return 'high-stock';
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
            <h2 className="mb-4">{t('dashboard.title')}</h2>

            <Row className="mb-4">
              <Col md={3}>
                <Card className="stats-card mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted">{t('dashboard.total_products')}</h6>
                        <h3>{stats.totalProducts}</h3>
                      </div>
                      <FaBoxes size={40} className="text-primary" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="stats-card mb-3" style={{ borderLeftColor: '#dc3545' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted">{t('dashboard.low_stock_items')}</h6>
                        <h3>{stats.lowStockItems}</h3>
                      </div>
                      <FaExclamationTriangle size={40} className="text-danger" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="stats-card mb-3" style={{ borderLeftColor: '#198754' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted">{t('dashboard.total_value')}</h6>
                        <h3>{CURRENCY_SYMBOL}{stats.totalValue.toFixed(2)}</h3>
                      </div>
                      <FaDollarSign size={40} className="text-success" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="stats-card mb-3" style={{ borderLeftColor: '#ffc107' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted">{t('dashboard.categories')}</h6>
                        <h3>{stats.categories}</h3>
                      </div>
                      <FaTags size={40} className="text-warning" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <h5>{t('dashboard.recent_products')}</h5>
                  </Card.Header>
                  <Card.Body>
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>{t('products.name')}</th>
                          <th>{t('products.category')}</th>
                          <th>{t('products.price')}</th>
                          <th>{t('products.stock')}</th>
                          <th>{t('dashboard.stock_status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{CURRENCY_SYMBOL}{product.price.toFixed(2)}</td>
                            <td>{product.stock}</td>
                            <td>
                              <span className={`badge stock-badge ${getStockBadgeClass(product.stock)}`}>
                                {product.stock < 10 ? 'Low' : product.stock < 50 ? 'Medium' : 'High'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
