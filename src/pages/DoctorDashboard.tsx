
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, FileCheck, User, Users } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();

  // Mock data
  const appointments = [
    { id: 1, patient: 'Jane Doe', date: '2025-04-20', time: '10:00 AM', status: 'Upcoming' },
    { id: 2, patient: 'John Smith', date: '2025-04-20', time: '11:30 AM', status: 'Upcoming' },
    { id: 3, patient: 'Emily Johnson', date: '2025-04-19', time: '3:00 PM', status: 'Completed' },
  ];
  
  const messages = [
    { id: 1, patient: 'Bob Williams', lastMessage: 'Thank you for the prescription, doctor!', time: '1 hour ago' },
    { id: 2, patient: 'Sarah Taylor', lastMessage: 'When should I take this medication?', time: '3 hours ago' },
  ];

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <h1 className="text-3xl font-bold mb-6 text-health-dark">Doctor Dashboard</h1>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">
            Manage your appointments, patient communications, and medical records from your personalized dashboard.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>
                  Your scheduled patient consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Patient</th>
                        <th className="py-2 text-left">Date</th>
                        <th className="py-2 text-left">Time</th>
                        <th className="py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.filter(a => a.status === 'Upcoming').map(appointment => (
                        <tr key={appointment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{appointment.patient}</td>
                          <td className="py-3">{appointment.date}</td>
                          <td className="py-3">{appointment.time}</td>
                          <td className="py-3">
                            <Badge className="bg-blue-500">{appointment.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Recent Messages
              </CardTitle>
              <CardDescription>
                Patient communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className="p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer rounded-md mb-2"
                >
                  <div className="flex justify-between mb-1">
                    <h4 className="font-medium">{message.patient}</h4>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.lastMessage}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="mr-2 h-5 w-5 text-primary" />
                Recent Medical Records
              </CardTitle>
              <CardDescription>
                Latest patient records and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">Jane Doe</span>
                    <span className="text-xs text-gray-500">2025-04-18</span>
                  </div>
                  <p className="text-sm text-gray-600">Annual checkup notes and prescription</p>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">John Smith</span>
                    <span className="text-xs text-gray-500">2025-04-17</span>
                  </div>
                  <p className="text-sm text-gray-600">Blood test results analysis</p>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Your Patients
              </CardTitle>
              <CardDescription>
                Patients under your care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="p-2 hover:bg-gray-50 rounded-md flex items-center justify-between">
                  <div>
                    <div className="font-medium">Jane Doe</div>
                    <div className="text-sm text-gray-600">Last visit: 2025-04-18</div>
                  </div>
                  <Badge>Active</Badge>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md flex items-center justify-between">
                  <div>
                    <div className="font-medium">John Smith</div>
                    <div className="text-sm text-gray-600">Last visit: 2025-04-17</div>
                  </div>
                  <Badge>Active</Badge>
                </li>
                <li className="p-2 hover:bg-gray-50 rounded-md flex items-center justify-between">
                  <div>
                    <div className="font-medium">Emily Johnson</div>
                    <div className="text-sm text-gray-600">Last visit: 2025-04-15</div>
                  </div>
                  <Badge>Active</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
