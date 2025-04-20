
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquare, Send, Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: number;
  content: string;
  sender: 'doctor' | 'patient';
  timestamp: string;
}

interface Patient {
  id: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  hospital?: string;
  approved: boolean;
  role: 'doctor';
}

const DoctorChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Mock patients data with actual user IDs
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Load doctor's appointments from localStorage
  useEffect(() => {
    const savedAppointments = localStorage.getItem('doctor_appointments');
    if (savedAppointments) {
      try {
        const parsedAppointments = JSON.parse(savedAppointments);
        // Filter appointments for the current doctor
        const doctorAppointments = parsedAppointments.filter(
          (appointment: any) => appointment.doctorId === user?.id
        );
        setAppointments(doctorAppointments);
      } catch (error) {
        console.error('Error parsing appointments:', error);
      }
    }
  }, [user]);

  // Load chat messages from user_chat_history (from patient to doctor)
  // This is where patient messages to doctors are stored
  useEffect(() => {
    // First, load any user-to-doctor chat messages
    const savedChats = localStorage.getItem('user_chat_history');
    let userToDoctorChats: Record<string, ChatMessage[]> = {};
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        
        // Since user_chat_history is keyed by doctorId, we need to find messages for this doctor
        if (user && parsedChats[user.id]) {
          userToDoctorChats[user.id] = parsedChats[user.id];
        }
      } catch (error) {
        console.error('Error parsing user chat history:', error);
      }
    }
    
    // Then, load existing doctor chat history
    const doctorChats = localStorage.getItem('doctor_chat_history');
    if (doctorChats) {
      try {
        const parsedDoctorChats = JSON.parse(doctorChats);
        setChatMessages({...userToDoctorChats, ...parsedDoctorChats});
      } catch (error) {
        console.error('Error parsing doctor chat history:', error);
      }
    } else {
      setChatMessages(userToDoctorChats);
    }
  }, [user]);
  
  // Get all users from localStorage to identify patients
  useEffect(() => {
    const mockUsersString = localStorage.getItem('healthhub_mock_users');
    if (mockUsersString) {
      try {
        const mockUsers = JSON.parse(mockUsersString);
        const patientUsers = mockUsers
          .filter((mockUser: any) => mockUser.role === 'user')
          .map((patientUser: any) => ({
            id: patientUser.id,
            name: patientUser.name,
            lastMessage: '', // Will be populated later if there are messages
            unreadCount: 0  // Will be populated later if there are unread messages
          }));
        
        // Add patients from appointments if they're not already in the list
        if (appointments.length > 0) {
          appointments.forEach(appointment => {
            if (!patientUsers.some((p: Patient) => p.id === appointment.patientId)) {
              patientUsers.push({
                id: appointment.patientId,
                name: appointment.patientName,
                lastMessage: `Appointment on ${appointment.date} at ${appointment.time}`,
                unreadCount: 0
              });
            }
          });
        }
        
        // Update patient list with message data
        const userChatHistory = localStorage.getItem('user_chat_history');
        if (userChatHistory && user) {
          const parsedUserChats = JSON.parse(userChatHistory);
          
          // Find messages sent to this doctor
          Object.keys(parsedUserChats).forEach(doctorId => {
            if (doctorId === user.id) {
              const messages = parsedUserChats[doctorId];
              if (messages && messages.length > 0) {
                // Group messages by sender (patient)
                const messagesByPatient: Record<string, ChatMessage[]> = {};
                
                messages.forEach((msg: ChatMessage) => {
                  const senderId = msg.sender === 'patient' ? msg.id.toString() : '';
                  if (!messagesByPatient[senderId]) {
                    messagesByPatient[senderId] = [];
                  }
                  messagesByPatient[senderId].push(msg);
                });
                
                // Update patients with their last message and unread count
                patientUsers.forEach((patient: Patient) => {
                  const patientMessages = messagesByPatient[patient.id];
                  if (patientMessages && patientMessages.length > 0) {
                    const lastMsg = patientMessages[patientMessages.length - 1];
                    patient.lastMessage = lastMsg.content;
                    patient.unreadCount = patientMessages.filter(
                      (m: ChatMessage) => m.sender === 'patient'
                    ).length;
                  }
                });
              }
            }
          });
        }
        
        setPatients(patientUsers);
      } catch (error) {
        console.error('Error parsing mock users:', error);
      }
    }
  }, [user, appointments]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedPatient) return;
    
    // Get current date/time for timestamp
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const timestamp = `${hours}:${minutes} ${ampm}`;
    
    // Create new message
    const newMessage: ChatMessage = {
      id: Date.now(),
      content: message,
      sender: 'doctor',
      timestamp: timestamp
    };
    
    // Update chat history
    const updatedChatHistory = { ...chatMessages };
    
    if (updatedChatHistory[selectedPatient.id]) {
      updatedChatHistory[selectedPatient.id] = [...updatedChatHistory[selectedPatient.id], newMessage];
    } else {
      updatedChatHistory[selectedPatient.id] = [newMessage];
    }
    
    // Update state and localStorage
    setChatMessages(updatedChatHistory);
    localStorage.setItem('doctor_chat_history', JSON.stringify(updatedChatHistory));
    
    // Log for debugging
    console.log(`Message to ${selectedPatient.name}: ${message}`);
    
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${selectedPatient.name}`,
    });
    
    // Clear the input
    setMessage('');
  };

  // Get patient appointments
  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(apt => apt.patientId === patientId);
  };

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <h1 className="text-3xl font-bold mb-6 text-health-dark">Patient Communications</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Patients
              </CardTitle>
              <CardDescription>Select a patient to chat with</CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length > 0 ? (
                <ul className="divide-y">
                  {patients.map((patient) => (
                    <li
                      key={patient.id}
                      className={`py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-md ${
                        selectedPatient?.id === patient.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-white">
                              {patient.name.charAt(0)}
                            </div>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {patient.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                        {patient.unreadCount ? (
                          <span className="inline-flex items-center justify-center h-5 w-5 bg-primary text-white text-xs rounded-full">
                            {patient.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No patients found
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedPatient ? `Chat with ${selectedPatient.name}` : 'Select a patient'}
              </CardTitle>
              {selectedPatient && getPatientAppointments(selectedPatient.id).length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium">Appointments</h3>
                  <div className="mt-1 space-y-1">
                    {getPatientAppointments(selectedPatient.id).map(apt => (
                      <div key={apt.id} className="flex items-center text-xs bg-blue-50 p-2 rounded-md">
                        <Calendar className="h-3 w-3 mr-1 text-primary" />
                        <span>{apt.date} at {apt.time}</span>
                        <Badge className="ml-2 text-[10px] px-1" variant="outline">{apt.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <>
                  <div className="border rounded-md p-4 h-96 mb-4 overflow-y-auto flex flex-col space-y-3">
                    {chatMessages[selectedPatient.id]?.length > 0 ? (
                      chatMessages[selectedPatient.id].map((msg) => (
                        <div
                          key={msg.id}
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.sender === 'doctor'
                              ? 'bg-primary text-white self-end'
                              : 'bg-gray-100 self-start'
                          }`}
                        >
                          <div className="text-sm">{msg.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              msg.sender === 'doctor' ? 'text-gray-200' : 'text-gray-500'
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>No messages with {selectedPatient.name} yet</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} type="button">
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                  <p>Select a patient to start chatting</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorChat;
