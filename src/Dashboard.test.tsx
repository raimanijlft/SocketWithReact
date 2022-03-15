import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

test('renders Socket Dashboard', () => {
  render(<Dashboard title='Test rendering...'/>);
  expect(document.getElementsByClassName("Web Socket Connection")[0]).toBeInTheDocument();
});
