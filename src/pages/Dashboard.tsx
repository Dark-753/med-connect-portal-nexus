
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, FileSearch, User } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <h1 className="text-3xl font-bold mb-6 text-health-dark">Patient Dashboard</h1>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">
            Manage your healthcare journey with HealthHub. Book appointments, chat with doctors, check your medical records, and more.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Chat with Doctors
              </CardTitle>
              <CardDescription>
                Connect with healthcare professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Have medical questions? Chat with our qualified doctors for quick advice and guidance.
              </p>
              <Link to="/chat">
                <Button className="w-full bg-primary hover:bg-primary/80">
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Appointments
              </CardTitle>
              <CardDescription>
                Schedule and manage your appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Book new appointments or view your upcoming and past consultations.
              </p>
              <Link to="/appointment">
                <Button className="w-full bg-primary hover:bg-primary/80">
                  Manage Appointments
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSearch className="mr-2 h-5 w-5 text-primary" />
                XRayVision
              </CardTitle>
              <CardDescription>
                Digital imaging and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Access your medical imaging results and diagnostic reports securely.
              </p>
              <Link to="/xray">
                <Button className="w-full bg-primary hover:bg-primary/80">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Your Profile
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Name</h3>
                <p className="font-normal">{user?.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Email</h3>
                <p className="font-normal">{user?.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/profile">
                <Button className="bg-secondary hover:bg-secondary/80">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
