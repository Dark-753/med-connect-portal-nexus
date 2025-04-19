
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';

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

const DoctorChat = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [message, setMessage] = useState('');
  
  // Mock patients data
  const patients: Patient[] = [
    { id: 'user-1', name: 'Jane Doe', lastMessage: 'How are you feeling today?', unreadCount: 2 },
    { id: 'user-2', name: 'John Smith', lastMessage: 'Thank you doctor', unreadCount: 0 },
    { id: 'user-3', name: 'Emily Johnson', lastMessage: 'When should I take the medicine?', unreadCount: 1 },
  ];

  // Mock chat history for each patient
  const chatHistory: Record<string, ChatMessage[]> = {
    'user-1': [
      { id: 1, content: 'Hello Dr. Smith', sender: 'patient', timestamp: '10:30 AM' },
      { id: 2, content: 'Hello Jane, how can I help you today?', sender: 'doctor', timestamp: '10:32 AM' },
      { id: 3, content: 'I\'ve been experiencing headaches for the past few days', sender: 'patient', timestamp: '10:33 AM' },
      { id: 4, content: 'How severe are they on a scale of 1-10?', sender: 'doctor', timestamp: '10:35 AM' },
      { id: 5, content: 'About a 7, and they\'re worse in the morning', sender: 'patient', timestamp: '10:36 AM' },
      { id: 6, content: 'Have you been experiencing any other symptoms?', sender: 'doctor', timestamp: '10:38 AM' },
    ],
    'user-2': [
      { id: 1, content: 'Dr. Smith, I got my test results', sender: 'patient', timestamp: '09:15 AM' },
      { id: 2, content: 'Great, let me take a look at those for you', sender: 'doctor', timestamp: '09:20 AM' },
      { id: 3, content: 'Thank you doctor', sender: 'patient', timestamp: '09:22 AM' },
    ],
    'user-3': [
      { id: 1, content: 'Hello doctor, I have a question about my prescription', sender: 'patient', timestamp: '11:45 AM' },
      { id: 2, content: 'Yes, what would you like to know?', sender: 'doctor', timestamp: '11:50 AM' },
      { id: 3, content: 'When should I take the medicine? With food or without?', sender: 'patient', timestamp: '11:52 AM' },
    ],
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedPatient) return;
    
    // In a real app, you would save the message to a database here
    console.log(`Message to ${selectedPatient.name}: ${message}`);
    
    // Clear the input
    setMessage('');
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
                            {patient.lastMessage}
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
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedPatient ? `Chat with ${selectedPatient.name}` : 'Select a patient'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <>
                  <div className="border rounded-md p-4 h-96 mb-4 overflow-y-auto flex flex-col space-y-3">
                    {chatHistory[selectedPatient.id]?.map((msg) => (
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
                    ))}
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
