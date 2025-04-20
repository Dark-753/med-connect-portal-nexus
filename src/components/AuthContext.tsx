
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

type UserRole = 'user' | 'doctor' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approved?: boolean;
  specialization?: string;
  hospital?: string;
  experience?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: UserRole, specialization?: string) => Promise<void>;
  approveDoctorRegistration: (doctorId: string) => void;
  getAllDoctors: () => User[];
  updateUserEmergencyContact: (userId: string, phone: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demonstration purposes
// In a real implementation, this data would be stored in the database
const INITIAL_MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@healthhub.com',
    name: 'Admin User',
    role: 'admin',
  },
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
    specialization: 'General Medicine',
    hospital: "St. Mary's Hospital",
    experience: "10 years"
  },
  {
    id: 'doctor-2',
    email: 'doctor2@example.com',
    name: 'Dr. Johnson',
    role: 'doctor',
    approved: false,
    specialization: 'Cardiology'
  },
  {
    id: 'doctor-3',
    email: 'wilson@example.com',
    name: 'Dr. Wilson',
    role: 'doctor',
    approved: false,
    specialization: 'Pediatrics'
  },
  {
    id: 'doctor-4',
    email: 'brown@example.com',
    name: 'Dr. Brown',
    role: 'doctor',
    approved: false,
    specialization: 'Neurology'
  },
];

const MOCK_PASSWORDS: Record<string, string> = {
  'admin@healthhub.com': 'admin123',
  'user@example.com': 'password123',
  'doctor@example.com': 'doctor123',
  'doctor2@example.com': 'doctor456',
  'wilson@example.com': 'wilson123',
  'brown@example.com': 'brown123',
};

// Helper function to convert Supabase User to our User format
const mapSupabaseUserToUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  if (!supabaseUser) return null;

  // First try to find a matching mock user (for development/testing)
  const mockUserString = localStorage.getItem('healthhub_mock_users');
  const mockUsers = mockUserString ? JSON.parse(mockUserString) : INITIAL_MOCK_USERS;
  const mockUser = mockUsers.find((u: User) => u.email.toLowerCase() === supabaseUser.email?.toLowerCase());
  
  if (mockUser) {
    return {
      ...mockUser,
      id: supabaseUser.id // Use Supabase ID
    };
  }

  // Default to basic user if no mock data is found
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || 'User',
    role: (supabaseUser.user_metadata?.role as UserRole) || 'user',
    approved: supabaseUser.user_metadata?.approved === true
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Load mock users from localStorage on initial render
  const initialMockUsers = (): User[] => {
    const storedUsers = localStorage.getItem('healthhub_mock_users');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    // Initialize localStorage with initial mock users if it doesn't exist
    localStorage.setItem('healthhub_mock_users', JSON.stringify(INITIAL_MOCK_USERS));
    return INITIAL_MOCK_USERS;
  };

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [mockUsers, setMockUsers] = useState<User[]>(initialMockUsers);

  // Update localStorage whenever mockUsers changes
  useEffect(() => {
    localStorage.setItem('healthhub_mock_users', JSON.stringify(mockUsers));
  }, [mockUsers]);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          const mappedUser = await mapSupabaseUserToUser(session.user);
          setUser(mappedUser);
          setSession(session);
          localStorage.setItem('healthhub_user', JSON.stringify(mappedUser));
        } else {
          setUser(null);
          setSession(null);
          localStorage.removeItem('healthhub_user');
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const mappedUser = await mapSupabaseUserToUser(session.user);
        setUser(mappedUser);
        setSession(session);
      } else {
        // Check for saved user in localStorage as fallback
        const savedUser = localStorage.getItem('healthhub_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Try to log in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // If Supabase authentication fails (development), fall back to mock data
        const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!foundUser || MOCK_PASSWORDS[email] !== password) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
          throw new Error('Invalid credentials');
        }

        if (foundUser.role === 'doctor' && foundUser.approved === false) {
          toast({
            title: "Access Denied",
            description: "Your account is pending approval by an administrator",
            variant: "destructive",
          });
          throw new Error('Doctor account not approved');
        }

        // Save user to localStorage for mock persistence
        localStorage.setItem('healthhub_user', JSON.stringify(foundUser));
        setUser(foundUser);
        
        toast({
          title: "Login Successful (Mock)",
          description: `Welcome back, ${foundUser.name}!`,
        });
      } else if (data.user) {
        const mappedUser = await mapSupabaseUserToUser(data.user);
        
        // For doctors, check if they're approved
        if (mappedUser?.role === 'doctor' && mappedUser.approved !== true) {
          toast({
            title: "Access Denied",
            description: "Your doctor account is pending approval",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          throw new Error('Doctor account not approved');
        }
        
        setUser(mappedUser);
        setSession(data.session);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${mappedUser?.name || 'User'}!`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Login Error",
        description: err.message || "An error occurred during login",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('healthhub_user');
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole, specialization?: string) => {
    setIsLoading(true);
    
    try {
      // Check if user already exists in mock data
      if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        toast({
          title: "Registration Failed",
          description: "Email already in use",
          variant: "destructive",
        });
        throw new Error('Email already in use');
      }
      
      // Create user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            approved: role !== 'doctor', // Auto-approve non-doctors
            specialization: role === 'doctor' ? specialization : undefined
          }
        }
      });
      
      if (error) {
        // Fall back to mock registration if Supabase fails
        const newUser: User = {
          id: `${role}-${Date.now()}`,
          email,
          name,
          role,
          approved: role === 'doctor' ? false : true,
          specialization: role === 'doctor' ? specialization : undefined,
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
        
        toast({
          title: role === 'doctor' ? "Registration Pending (Mock)" : "Registration Successful (Mock)",
          description: role === 'doctor' 
            ? "Your account has been created and is awaiting admin approval" 
            : "Your account has been created",
        });
      } else {
        if (role === 'doctor') {
          toast({
            title: "Registration Pending",
            description: "Your account has been created and is awaiting admin approval",
          });
        } else if (data.user) {
          const mappedUser = await mapSupabaseUserToUser(data.user);
          setUser(mappedUser);
          
          toast({
            title: "Registration Successful",
            description: "Your account has been created",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Registration Error",
        description: err.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveDoctorRegistration = (doctorId: string) => {
    // Update the mock data
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
  
  const getAllDoctors = () => {
    // Return doctors from the mock data in localStorage
    return mockUsers.filter(user => user.role === 'doctor');
  };

  const updateUserEmergencyContact = (userId: string, phone: string, email: string) => {
    const updatedUsers = mockUsers.map(user => {
      if (user.id === userId) {
        return { 
          ...user, 
          emergencyPhone: phone,
          emergencyEmail: email
        };
      }
      return user;
    });
    
    setMockUsers(updatedUsers);
    
    // If the current user is being updated, also update the user state
    if (user && user.id === userId) {
      const updatedUser = {
        ...user,
        emergencyPhone: phone,
        emergencyEmail: email
      };
      
      setUser(updatedUser);
      
      // Update localStorage to persist the changes
      localStorage.setItem('healthhub_user', JSON.stringify(updatedUser));
    }
    
    toast({
      title: "Emergency Contacts Updated",
      description: "Your emergency contact information has been saved",
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
      approveDoctorRegistration,
      getAllDoctors,
      updateUserEmergencyContact
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
