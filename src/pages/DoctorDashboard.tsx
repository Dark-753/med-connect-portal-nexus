
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, FileCheck, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);

  // Load doctor's appointments and messages
  useEffect(() => {
    // Load appointments
    const savedAppointments = localStorage.getItem('doctor_appointments');
    if (savedAppointments && user) {
      try {
        const allAppointments = JSON.parse(savedAppointments);
        // Filter appointments for this doctor
        const doctorAppointments = allAppointments.filter(
          appointment => appointment.doctorId === user.id
        );
        setAppointments(doctorAppointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    }

    // Load messages
    const userChatHistory = localStorage.getItem('user_chat_history');
    if (userChatHistory && user) {
      try {
        const chatHistory = JSON.parse(userChatHistory);
        // Check if there are messages for this doctor
        if (chatHistory[user.id]) {
          // Get the last message from each patient
          const patientMessages = [];
          const patientIds = new Set();
          
          // Find all unique patients who sent messages
          chatHistory[user.id].forEach(msg => {
            if (msg.sender === 'patient') {
              patientIds.add(msg.patientId || '');
            }
          });
          
          // Get user data to match patient IDs to names
          const mockUsersString = localStorage.getItem('healthhub_mock_users');
          let mockUsers = [];
          if (mockUsersString) {
            mockUsers = JSON.parse(mockUsersString);
          }
          
          // For each patient, find their latest message
          patientIds.forEach(patientId => {
            if (!patientId) return;
            
            const patientMsgs = chatHistory[user.id].filter(
              msg => msg.sender === 'patient' && msg.patientId === patientId
            );
            
            if (patientMsgs.length > 0) {
              const lastMsg = patientMsgs[patientMsgs.length - 1];
              const patientUser = mockUsers.find(u => u.id === patientId);
              patientMessages.push({
                id: patientId,
                patient: patientUser ? patientUser.name : 'Unknown Patient',
                lastMessage: lastMsg.content,
                time: lastMsg.timestamp
              });
            }
          });
          
          setMessages(patientMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <h1 className="text-3xl font-bold mb-6 text-health-dark">Doctor Dashboard</h1>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
              <p className="text-gray-600">
                Manage your appointments, patient communications, and medical records from your personalized dashboard.
              </p>
            </div>
            <Link to="/doctor/chat">
              <Button className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Open Patient Chat
              </Button>
            </Link>
          </div>
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
                      {appointments.filter(a => a.status === 'Upcoming').length > 0 ? (
                        appointments.filter(a => a.status === 'Upcoming').map(appointment => (
                          <tr key={appointment.id} className="border-b hover:bg-gray-50">
                            <td className="py-3">{appointment.patientName}</td>
                            <td className="py-3">{appointment.date}</td>
                            <td className="py-3">{appointment.time}</td>
                            <td className="py-3">
                              <Badge className="bg-blue-500">{appointment.status}</Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">
                            No upcoming appointments
                          </td>
                        </tr>
                      )}
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
              {messages.length > 0 ? (
                messages.map(message => (
                  <Link 
                    key={message.id}
                    to="/doctor/chat" 
                    className="block p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer rounded-md mb-2"
                  >
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">{message.patient}</h4>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{message.lastMessage}</p>
                  </Link>
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No recent messages
                </div>
              )}
              <div className="mt-4">
                <Link to="/doctor/chat">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View All Messages
                  </Button>
                </Link>
              </div>
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

