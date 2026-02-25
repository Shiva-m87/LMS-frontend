import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <Link to="/">LMS & Reimbursements</Link>
                </div>
                <div className="nav-links">
                    {user ? (
                        <>
                            <span className="nav-link" style={{ cursor: 'default' }}>
                                {user.name} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({user.role})</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline"
                                style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Register</Link>
                        </>
                    )}
                </div>
            </nav>
            <main className="container mt-4 mb-4">
                <Outlet />
            </main>
        </>
    );
};

export default Layout;
