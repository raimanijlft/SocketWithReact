import React from 'react';
import { render, screen } from '@testing-library/react';
import {SocketDashboard} from './SocketDashboard';

test('renders Socket Dashboard', () => {
  render(<SocketDashboard />);
  expect(document.getElementsByClassName("Web Socket Connection")[0]).toBeInTheDocument();
});
