
import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, UserCheck, UserX } from 'lucide-react';

const AdminDashboard = () => {
  const { user, approveDoctorRegistration } = useAuth();
  
  // Mock data for pending doctor registrations
  const [pendingDoctors, setPendingDoctors] = useState([
    { id: 'doctor-2', name: 'Dr. Johnson', email: 'doctor2@example.com', specialization: 'Cardiology' },
    { id: 'doctor-3', name: 'Dr. Wilson', email: 'wilson@example.com', specialization: 'Pediatrics' },
    { id: 'doctor-4', name: 'Dr. Brown', email: 'brown@example.com', specialization: 'Neurology' },
  ]);
  
  // Mock data for doctors
  const [approvedDoctors] = useState([
    { id: 'doctor-1', name: 'Dr. Smith', email: 'doctor@example.com', specialization: 'General Medicine' },
  ]);
  
  // Mock data for users
  const [users] = useState([
    { id: 'user-1', name: 'Test User', email: 'user@example.com' },
    { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com' },
    { id: 'user-3', name: 'Bob Smith', email: 'bob@example.com' },
  ]);

  const handleApprove = (doctorId: string) => {
    approveDoctorRegistration(doctorId);
    setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
  };

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <div className="flex items-center mb-6">
          <Shield className="text-secondary mr-2 h-6 w-6" />
          <h1 className="text-3xl font-bold text-health-dark">Admin Dashboard</h1>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}</h2>
          <p className="text-gray-600">
            As the system administrator, you can manage doctors, approve registrations, and oversee all users.
          </p>
        </div>
        
        <div className="mb-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-primary" />
                Pending Doctor Approvals
              </CardTitle>
              <CardDescription>
                New doctor registration requests that require your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDoctors.length === 0 ? (
                <p className="text-gray-500">No pending doctor registration requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Name</th>
                        <th className="py-2 text-left">Email</th>
                        <th className="py-2 text-left">Specialization</th>
                        <th className="py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDoctors.map(doctor => (
                        <tr key={doctor.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{doctor.name}</td>
                          <td className="py-3">{doctor.email}</td>
                          <td className="py-3">{doctor.specialization}</td>
                          <td className="py-3">
                            <Button 
                              variant="outline" 
                              className="border-green-500 text-green-500 hover:bg-green-50"
                              onClick={() => handleApprove(doctor.id)}
                            >
                              Approve
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-primary" />
                  Approved Doctors
                </CardTitle>
                <CardDescription>
                  Currently active doctor accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Name</th>
                        <th className="py-2 text-left">Email</th>
                        <th className="py-2 text-left">Specialization</th>
                        <th className="py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedDoctors.map(doctor => (
                        <tr key={doctor.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{doctor.name}</td>
                          <td className="py-3">{doctor.email}</td>
                          <td className="py-3">{doctor.specialization}</td>
                          <td className="py-3">
                            <Badge className="bg-green-500">Active</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Registered Patients
                </CardTitle>
                <CardDescription>
                  All patient accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Name</th>
                        <th className="py-2 text-left">Email</th>
                        <th className="py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{user.name}</td>
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">
                            <Badge className="bg-blue-500">Active</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
