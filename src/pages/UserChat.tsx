
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
  hospital: string;
  lastMessage?: string;
  unreadCount?: number;
}

const UserChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [message, setMessage] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  
  // Mock doctors data
  const doctors: Doctor[] = [
    { id: 'doctor-1', name: 'Dr. Smith', specialization: 'General Medicine', hospital: "St. Mary's Hospital", lastMessage: 'How are you feeling today?', unreadCount: 0 },
    { id: 'doctor-2', name: 'Dr. Johnson', specialization: 'Cardiology', hospital: 'Central Hospital', lastMessage: 'Remember to take your medication', unreadCount: 1 },
    { id: 'doctor-3', name: 'Dr. Wilson', specialization: 'Pediatrics', hospital: 'Children\'s Medical Center', lastMessage: 'Your test results look good', unreadCount: 0 },
    { id: 'doctor-4', name: 'Dr. Brown', specialization: 'Neurology', hospital: 'Central Hospital', lastMessage: '', unreadCount: 0 },
    { id: 'doctor-5', name: 'Dr. Davis', specialization: 'Cardiology', hospital: "St. Mary's Hospital", lastMessage: '', unreadCount: 0 },
    { id: 'doctor-6', name: 'Dr. Miller', specialization: 'General Medicine', hospital: 'Central Hospital', lastMessage: '', unreadCount: 0 },
  ];

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem('user_chat_history');
    if (savedChats) {
      setChatMessages(JSON.parse(savedChats));
    } else {
      // Initialize with mock data if no saved chats
      const initialChatHistory: Record<string, ChatMessage[]> = {
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
      setChatMessages(initialChatHistory);
      localStorage.setItem('user_chat_history', JSON.stringify(initialChatHistory));
    }
  }, []);

  // Get unique hospitals and specializations
  const hospitals = [...new Set(doctors.map(doctor => doctor.hospital))];
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];
  
  // Filter doctors based on selected hospital and specialization
  useEffect(() => {
    let filtered = [...doctors];
    
    if (selectedHospital && selectedHospital !== 'all') {
      filtered = filtered.filter(doctor => doctor.hospital === selectedHospital);
    }
    
    if (selectedSpecialization && selectedSpecialization !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialization);
    }
    
    setFilteredDoctors(filtered);
    
    // Clear selected doctor if it's not in the filtered list
    if (selectedDoctor && !filtered.some(doctor => doctor.id === selectedDoctor.id)) {
      setSelectedDoctor(null);
    }
  }, [selectedHospital, selectedSpecialization, doctors]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedDoctor) return;
    
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
      sender: 'patient',
      timestamp: timestamp
    };
    
    // Update chat history
    const updatedChatHistory = { ...chatMessages };
    
    if (updatedChatHistory[selectedDoctor.id]) {
      updatedChatHistory[selectedDoctor.id] = [...updatedChatHistory[selectedDoctor.id], newMessage];
    } else {
      updatedChatHistory[selectedDoctor.id] = [newMessage];
    }
    
    // Update state and localStorage
    setChatMessages(updatedChatHistory);
    localStorage.setItem('user_chat_history', JSON.stringify(updatedChatHistory));
    
    // Log for debugging
    console.log(`Message to ${selectedDoctor.name}: ${message}`);
    
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${selectedDoctor.name}`,
    });
    
    // Clear the input
    setMessage('');
  };

  const handleHospitalChange = (value: string) => {
    setSelectedHospital(value);
  };

  const handleSpecializationChange = (value: string) => {
    setSelectedSpecialization(value);
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
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hospital</label>
                  <Select value={selectedHospital} onValueChange={handleHospitalChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hospitals</SelectItem>
                      {hospitals.map(hospital => (
                        <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <Select value={selectedSpecialization} onValueChange={handleSpecializationChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      {specializations.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDoctors.length > 0 ? (
                <ul className="divide-y">
                  {filteredDoctors.map((doctor) => (
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
                            <p className="text-xs text-gray-500">{doctor.hospital}</p>
                            {doctor.lastMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {doctor.lastMessage}
                              </p>
                            )}
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
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No doctors match your filters
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDoctor ? `Chat with ${selectedDoctor.name}` : 'Select a doctor'}
              </CardTitle>
              {selectedDoctor && (
                <CardDescription>
                  {selectedDoctor.specialization} at {selectedDoctor.hospital}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedDoctor ? (
                <>
                  <div className="border rounded-md p-4 h-96 mb-4 overflow-y-auto flex flex-col space-y-3">
                    {chatMessages[selectedDoctor.id]?.length > 0 ? (
                      chatMessages[selectedDoctor.id]?.map((msg) => (
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
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>Start a conversation with {selectedDoctor.name}</p>
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
