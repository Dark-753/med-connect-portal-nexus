
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";

type UserRole = 'user' | 'doctor' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approved?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  approveDoctorRegistration: (doctorId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data
const ADMIN_USER: User = {
  id: 'admin-1',
  email: 'admin@healthhub.com',
  name: 'Admin User',
  role: 'admin',
};

const MOCK_USERS: User[] = [
  ADMIN_USER,
  {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
  },
  {
    id: 'doctor-1',
    email: 'doctor@example.com',
    name: 'Dr. Smith',
    role: 'doctor',
    approved: true,
  },
  {
    id: 'doctor-2',
    email: 'doctor2@example.com',
    name: 'Dr. Johnson',
    role: 'doctor',
    approved: false,
  },
];

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@healthhub.com': 'admin123',
  'user@example.com': 'password123',
  'doctor@example.com': 'doctor123',
  'doctor2@example.com': 'doctor456',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState<User[]>(MOCK_USERS);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('healthhub_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser || MOCK_PASSWORDS[email] !== password) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }

    if (foundUser.role === 'doctor' && foundUser.approved === false) {
      toast({
        title: "Access Denied",
        description: "Your account is pending approval by an administrator",
        variant: "destructive",
      });
      setIsLoading(false);
      throw new Error('Doctor account not approved');
    }

    // Save user to localStorage
    localStorage.setItem('healthhub_user', JSON.stringify(foundUser));
    setUser(foundUser);
    setIsLoading(false);
    
    toast({
      title: "Login Successful",
      description: `Welcome back, ${foundUser.name}!`,
    });
  };

  const logout = () => {
    localStorage.removeItem('healthhub_user');
    setUser(null);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: "Registration Failed",
        description: "Email already in use",
        variant: "destructive",
      });
      setIsLoading(false);
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      email,
      name,
      role,
      approved: role === 'doctor' ? false : true,
    };
    
    // Update mock users and passwords
    const updatedUsers = [...mockUsers, newUser];
    setMockUsers(updatedUsers);
    MOCK_PASSWORDS[email] = password;

    // Don't automatically log in doctors that need approval
    if (role !== 'doctor') {
      localStorage.setItem('healthhub_user', JSON.stringify(newUser));
      setUser(newUser);
    }
    
    setIsLoading(false);
    
    if (role === 'doctor') {
      toast({
        title: "Registration Pending",
        description: "Your account has been created and is awaiting admin approval",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: "Your account has been created",
      });
    }
  };

  const approveDoctorRegistration = (doctorId: string) => {
    const updatedUsers = mockUsers.map(user => {
      if (user.id === doctorId) {
        return { ...user, approved: true };
      }
      return user;
    });
    
    setMockUsers(updatedUsers);
    
    toast({
      title: "Doctor Approved",
      description: "The doctor can now access the system",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login,
      logout,
      register,
      approveDoctorRegistration
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
