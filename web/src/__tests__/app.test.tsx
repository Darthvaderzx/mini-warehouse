import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackOfficeApp from '../app/page';

describe('BackOffice Web App', () => {
  it('renders dashboard correctly', () => {
    render(<BackOfficeApp />);
    expect(screen.getByText('MiniWarehouse')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
