import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfilePage } from './ProfilePage';
import * as AuthContextModule from '../../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe('ProfilePage', () => {
    const mockUpdateUser = vi.fn();
    const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatar: undefined,
        createdAt: '2023-01-01T00:00:00Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation
        (AuthContextModule.useAuth as Mock).mockReturnValue({
            user: mockUser,
            token: 'fake-token',
            updateUser: mockUpdateUser,
        });

        // Mock fetch - return promises for stats and matches
        globalThis.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('/users/me/stats')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ totalMatches: 0, wins: 0, losses: 0, winRate: 0 }),
                });
            }
            if (url.includes('/users/me/matches')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [],
                });
            }
            return Promise.resolve({ ok: false });
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders user information correctly', () => {
        render(<ProfilePage />);
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Level 1')).toBeInTheDocument();
    });

    it('displays default avatar when no avatar is present', () => {
        render(<ProfilePage />);
        const img = screen.getByAltText('testuser') as HTMLImageElement;
        expect(img.src).toContain('data:image/svg+xml');
    });

    it('displays correct URL for relative avatar path', () => {
        (AuthContextModule.useAuth as Mock).mockReturnValue({
            user: { ...mockUser, avatar: '/uploads/avatars/me.jpg' },
            token: 'fake-token',
            updateUser: mockUpdateUser,
        });

        render(<ProfilePage />);
        const img = screen.getByAltText('testuser') as HTMLImageElement;
        // Assuming VITE_API_URL or default localhost:3000
        expect(img.src).toContain('https://localhost:3000/uploads/avatars/me.jpg');
    });

    it('displays correct URL for absolute avatar path', () => {
        (AuthContextModule.useAuth as Mock).mockReturnValue({
            user: { ...mockUser, avatar: 'http://example.com/avatar.jpg' },
            token: 'fake-token',
            updateUser: mockUpdateUser,
        });

        render(<ProfilePage />);
        const img = screen.getByAltText('testuser') as HTMLImageElement;
        expect(img.src).toBe('http://example.com/avatar.jpg');
    });

    it('handles avatar upload successfully', async () => {
        render(<ProfilePage />);

        // Create a dummy file
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByTestId('avatar-upload');

        // Mock successful fetch
        (globalThis.fetch as Mock).mockResolvedValueOnce({
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ avatarUrl: '/uploads/avatars/new.png' }),
        });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/users/avatar'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData),
                })
            );
        });

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({ avatar: '/uploads/avatars/new.png' });
        });
    });

    it('handles upload failure due to invalid server response', async () => {
        render(<ProfilePage />);

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByTestId('avatar-upload');

        // Mock fetch returning bad JSON
        (globalThis.fetch as Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ wrongKey: 'value' }),
        });

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/Invalid response format from server/i)).toBeInTheDocument();
        });

        expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('handles upload failure due to network error', async () => {
        render(<ProfilePage />);

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByTestId('avatar-upload');

        // Mock fetch error
        (globalThis.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    it('deletes avatar successfully', async () => {
        (AuthContextModule.useAuth as Mock).mockReturnValue({
            user: { ...mockUser, avatar: '/current.jpg' },
            token: 'fake-token',
            updateUser: mockUpdateUser,
        });
        mockConfirm.mockReturnValue(true);

        render(<ProfilePage />);

        const deleteButton = screen.getByText('Remove Picture');

        // Mock delete success
        (globalThis.fetch as Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ avatarUrl: null }),
        });

        fireEvent.click(deleteButton);

        expect(mockConfirm).toHaveBeenCalled();

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/users/avatar/delete'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        await waitFor(() => {
            expect(mockUpdateUser).toHaveBeenCalledWith({ avatar: null });
        });
    });
});
