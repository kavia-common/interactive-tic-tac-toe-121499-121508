import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders header and allows first move by X', () => {
  render(<App />);

  // Header is present
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();

  // Reset button exists
  expect(screen.getByRole('button', { name: /reset game/i })).toBeInTheDocument();

  // First move should place X
  const sq0 = screen.getByTestId('square-0');
  fireEvent.click(sq0);
  expect(sq0).toHaveTextContent('X');
});
