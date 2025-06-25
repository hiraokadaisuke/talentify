import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app heading', () => {
  render(<App />);
  const heading = screen.getByText(/Talentify - 人材管理/i);
  expect(heading).toBeInTheDocument();
});
