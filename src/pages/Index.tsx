
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-health-green">
      <div className="health-container py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-health-dark">Welcome to HealthHub</h1>
          
          <div className="bg-white rounded-lg p-8 mb-10 shadow-md max-w-xl mx-auto">
            <img 
              src="/lovable-uploads/4bc3c0bc-8d82-4963-bc2a-7b3436b9dad4.png" 
              alt="HealthHub Logo" 
              className="health-logo mx-auto" 
            />
          </div>
          
          <p className="text-xl text-health-dark mb-6">
            HealthHub is your one-stop destination for all your healthcare needs. Chat with doctors, book appointments, manage your profile, and more!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2 text-lg">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-primary hover:bg-primary/80 text-white px-6 py-2 text-lg">
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'user' && (
                  <>
                    <Link to="/chat">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        Chat with a Doctor
                      </Button>
                    </Link>
                    <Link to="/appointment">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        Book an Appointment
                      </Button>
                    </Link>
                    <Link to="/xray">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        XRayVision
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        Manage Your Profile
                      </Button>
                    </Link>
                  </>
                )}
                {user?.role === 'doctor' && (
                  <Link to="/doctor">
                    <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                      Go to Doctor Dashboard
                    </Button>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
