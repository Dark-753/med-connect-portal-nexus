
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

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  lastMessage?: string;
  unreadCount?: number;
}

const UserChat = () => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [message, setMessage] = useState('');
  
  // Mock doctors data
  const doctors: Doctor[] = [
    { id: 'doctor-1', name: 'Dr. Smith', specialization: 'General Medicine', lastMessage: 'How are you feeling today?', unreadCount: 0 },
    { id: 'doctor-2', name: 'Dr. Johnson', specialization: 'Cardiology', lastMessage: 'Remember to take your medication', unreadCount: 1 },
    { id: 'doctor-3', name: 'Dr. Wilson', specialization: 'Pediatrics', lastMessage: 'Your test results look good', unreadCount: 0 },
  ];

  // Mock chat history for each doctor
  const chatHistory: Record<string, ChatMessage[]> = {
    'doctor-1': [
      { id: 1, content: 'Hello, how can I help you today?', sender: 'doctor', timestamp: '10:30 AM' },
      { id: 2, content: 'Hi Dr. Smith, I\'ve been having headaches lately', sender: 'patient', timestamp: '10:32 AM' },
      { id: 3, content: 'How severe are they on a scale of 1-10?', sender: 'doctor', timestamp: '10:33 AM' },
      { id: 4, content: 'About a 7, and they\'re worse in the morning', sender: 'patient', timestamp: '10:35 AM' },
      { id: 5, content: 'Have you been experiencing any other symptoms?', sender: 'doctor', timestamp: '10:36 AM' },
    ],
    'doctor-2': [
      { id: 1, content: 'Hello, I\'m Dr. Johnson. I\'ve reviewed your heart tests.', sender: 'doctor', timestamp: '09:15 AM' },
      { id: 2, content: 'Thanks doctor, what did you find?', sender: 'patient', timestamp: '09:20 AM' },
      { id: 3, content: 'Everything looks normal. Remember to take your medication as prescribed.', sender: 'doctor', timestamp: '09:22 AM' },
    ],
    'doctor-3': [
      { id: 1, content: 'Hello, I\'m Dr. Wilson. How is your child doing?', sender: 'doctor', timestamp: '11:45 AM' },
      { id: 2, content: 'Much better now, thank you. The fever is gone.', sender: 'patient', timestamp: '11:50 AM' },
      { id: 3, content: 'That\'s great news! Your test results look good too.', sender: 'doctor', timestamp: '11:52 AM' },
    ],
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedDoctor) return;
    
    // In a real app, you would save the message to a database here
    console.log(`Message to ${selectedDoctor.name}: ${message}`);
    
    // Clear the input
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <h1 className="text-3xl font-bold mb-6 text-health-dark">Chat with Doctors</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                My Doctors
              </CardTitle>
              <CardDescription>Select a doctor to chat with</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {doctors.map((doctor) => (
                  <li
                    key={doctor.id}
                    className={`py-3 px-2 cursor-pointer hover:bg-gray-50 rounded-md ${
                      selectedDoctor?.id === doctor.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-white">
                            {doctor.name.charAt(0)}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-xs text-gray-500">{doctor.specialization}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {doctor.lastMessage}
                          </p>
                        </div>
                      </div>
                      {doctor.unreadCount ? (
                        <span className="inline-flex items-center justify-center h-5 w-5 bg-primary text-white text-xs rounded-full">
                          {doctor.unreadCount}
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
                {selectedDoctor ? `Chat with ${selectedDoctor.name}` : 'Select a doctor'}
              </CardTitle>
              {selectedDoctor && (
                <CardDescription>{selectedDoctor.specialization}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedDoctor ? (
                <>
                  <div className="border rounded-md p-4 h-96 mb-4 overflow-y-auto flex flex-col space-y-3">
                    {chatHistory[selectedDoctor.id]?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender === 'doctor'
                            ? 'bg-primary text-white self-start'
                            : 'bg-gray-100 self-end'
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
                  <p>Select a doctor to start chatting</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserChat;
