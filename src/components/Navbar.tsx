
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthContext';
import { LogOut, Menu, X, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const getNavLinks = () => {
    const commonLinks = (
      <>
        <Link to="/" className="hover:text-accent" onClick={closeMenu}>Home</Link>
      </>
    );

    const authLinks = isAuthenticated ? (
      <>
        {user?.role === 'admin' && (
          <Link to="/admin" className="hover:text-accent" onClick={closeMenu}>Admin Dashboard</Link>
        )}
        {user?.role === 'doctor' && (
          <Link to="/doctor" className="hover:text-accent" onClick={closeMenu}>Doctor Dashboard</Link>
        )}
        {user?.role === 'user' && (
          <>
            <Link to="/chat" className="hover:text-accent" onClick={closeMenu}>Chat with Doctor</Link>
            <Link to="/xray" className="hover:text-accent" onClick={closeMenu}>XRayVision</Link>
            <Link to="/appointment" className="hover:text-accent" onClick={closeMenu}>Book Appointment</Link>
          </>
        )}
        <Link to="/profile" className="hover:text-accent" onClick={closeMenu}>Profile</Link>
      </>
    ) : (
      <>
        <Link to="/login" className="hover:text-accent" onClick={closeMenu}>Login</Link>
        <Link to="/register" className="hover:text-accent" onClick={closeMenu}>Register</Link>
      </>
    );

    return (
      <>
        {commonLinks}
        {authLinks}
      </>
    );
  };

  return (
    <nav className="bg-secondary text-white p-4">
      <div className="health-container flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">HealthHub</Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          {getNavLinks()}
          
          {isAuthenticated && (
            <Button 
              variant="outline" 
              className="ml-4 text-white border-white hover:bg-white hover:text-secondary"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-secondary pt-2 pb-4">
          <div className="health-container flex flex-col space-y-4">
            {getNavLinks()}
            
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-secondary"
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
