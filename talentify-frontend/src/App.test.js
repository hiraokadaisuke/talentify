import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders app heading', () => {
  render(<App />);
  const heading = screen.getByText(/Talentify - 人材管理/i);
  expect(heading).toBeInTheDocument();
});

test('fetches CSRF token before posting new talent', async () => {
  const user = userEvent;

  global.fetch = jest
    .fn()
    // initial fetchTalents on mount
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    // csrf token fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ csrfToken: 'test' }) })
    // post talent
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    // fetchTalents after adding
    .mockResolvedValueOnce({ ok: true, json: async () => [] });

  render(<App />);

  await user.type(screen.getAllByRole('textbox')[0], 'John');
  await user.type(screen.getAllByRole('textbox')[1], 'john@example.com');
  await user.type(screen.getAllByRole('textbox')[2], 'skill');
  await user.type(screen.getByRole('spinbutton'), '1');

  await user.click(screen.getByRole('button', { name: '人材を追加' }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(4));

  const csrfCall = global.fetch.mock.calls.find(([url]) => url.includes('/api/csrf-token'));
  const postCall = global.fetch.mock.calls.find(
    ([url, options]) => url.includes('/api/talents') && options.method === 'POST'
  );

  expect(csrfCall).toBeTruthy();
  expect(postCall[1].headers['X-CSRF-Token']).toBe('test');
});
