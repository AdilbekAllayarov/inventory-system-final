import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Loader = () => {
  const { t } = useTranslation();
  
  return (
    <div className="loader-container">
      <div className="text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
        <p className="mt-3 text-muted">{t('common.loading')}</p>
      </div>
    </div>
  );
};

export default Loader;
