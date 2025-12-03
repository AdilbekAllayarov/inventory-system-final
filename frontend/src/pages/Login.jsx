import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container>
        <Card className="login-card mx-auto shadow">
          <Card.Body className="p-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>{t('login.title')}</h2>
              <LanguageSwitcher />
            </div>
            <p className="text-muted mb-4">{t('login.welcome')}</p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{t('login.username')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('login.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>{t('login.password')}</Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t('login.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('login.submit')}
              </Button>
            </Form>

            <div className="mt-3 text-muted small text-center">
              Default: admin / Admin!2025#Secure
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
