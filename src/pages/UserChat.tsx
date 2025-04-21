import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquare, Send, Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { askHealthBot, saveToHistory } from '@/utils/healthBot';

interface ChatMessage {
  id: number;
  content: string;
  sender: 'doctor' | 'patient';
  timestamp: string;
  patientId?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  hospital?: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'user' | 'admin';
  approved?: boolean;
  specialization?: string;
  hospital?: string;
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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [botQuestion, setBotQuestion] = useState('');
  const [botAnswer, setBotAnswer] = useState('');
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [botHistory, setBotHistory] = useState<{question: string, answer: string}[]>([]);
  
  // Debug user info
  useEffect(() => {
    if (user) {
      console.log("User Chat - User ID:", user.id);
      console.log("User Chat - User Name:", user.name);
    }
  }, [user]);
  
  // Load doctors from localStorage
  useEffect(() => {
    // Get all doctors from localStorage
    const mockUsersString = localStorage.getItem('healthhub_mock_users');
    if (mockUsersString) {
      try {
        const mockUsers = JSON.parse(mockUsersString);
        const approvedDoctors = mockUsers
          .filter((user: StoredUser) => user.role === 'doctor' && user.approved === true)
          .map((doctor: StoredUser) => ({
            id: doctor.id,
            name: doctor.name,
            specialization: doctor.specialization || 'General',
            hospital: doctor.hospital || 'Unknown Hospital',
            lastMessage: '',
            unreadCount: 0
          }));
        
        console.log('Approved doctors loaded:', approvedDoctors);
        setDoctors(approvedDoctors);
        
        // Extract unique hospitals and specializations
        const uniqueHospitals = [...new Set(approvedDoctors
          .map((doctor: Doctor) => doctor.hospital)
          .filter(Boolean))] as string[];
        
        const uniqueSpecializations = [...new Set(approvedDoctors
          .map((doctor: Doctor) => doctor.specialization)
          .filter(Boolean))] as string[];
        
        setHospitals(uniqueHospitals);
        setSpecializations(uniqueSpecializations);
      } catch (error) {
        console.error('Error parsing mock users:', error);
      }
    }
  }, []);

  // Load chat histories
  useEffect(() => {
    if (!user) return;
    
    // First, load messages sent by the patient
    let combinedMessages: Record<string, ChatMessage[]> = {};
    
    const savedPatientChats = localStorage.getItem('user_chat_history');
    if (savedPatientChats) {
      try {
        const parsedChats = JSON.parse(savedPatientChats);
        
        // For each doctor the patient has messaged
        Object.keys(parsedChats || {}).forEach(doctorId => {
          combinedMessages[doctorId] = parsedChats[doctorId] || [];
        });
      } catch (error) {
        console.error('Error parsing user chat history:', error);
      }
    }
    
    // Then, load messages sent by doctors to this patient
    const doctorChats = localStorage.getItem('doctor_chat_history');
    if (doctorChats) {
      try {
        const parsedDoctorChats = JSON.parse(doctorChats);
        
        // Check if any doctor has sent messages to this patient
        if (parsedDoctorChats && parsedDoctorChats[user.id]) {
          if (!combinedMessages[user.id]) {
            combinedMessages[user.id] = [];
          }
          
          // Add messages sent by doctors to this patient
          combinedMessages[user.id] = [
            ...combinedMessages[user.id],
            ...(parsedDoctorChats[user.id] || [])
          ];
        }
      } catch (error) {
        console.error('Error parsing doctor chat history:', error);
      }
    }
    
    setChatMessages(combinedMessages);
  }, [user]);

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
  }, [selectedHospital, selectedSpecialization, doctors, selectedDoctor]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedDoctor || !user) return;
    
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
      timestamp: timestamp,
      patientId: user.id // Always add patientId to messages
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
    
    console.log(`Message sent to doctor ${selectedDoctor.id}:`, newMessage);
    
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

  // --- Add AI assistant (HealthBot) handler
  async function handleAskBot() {
    if (!botQuestion.trim()) return;
    setIsBotLoading(true);
    setBotAnswer('');

    try {
      const answer = await askHealthBot(botQuestion);
      
      // Save to history
      setBotHistory(prev => saveToHistory(prev, botQuestion, answer));
      setBotAnswer(answer);
    } catch (err) {
      toast({
        title: "Error",
        description: "There was a problem connecting to HealthBot. Using offline responses instead.",
        variant: "destructive"
      });
      setBotAnswer('Sorry, there was an error contacting HealthBot.');
    }
    setIsBotLoading(false);
  }

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <h1 className="text-3xl font-bold mb-6 text-health-dark">Chat with Doctors</h1>

        {/* HealthBot Chat Button - Fixed Position */}
        <div className="fixed bottom-6 right-6 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                className="h-14 w-14 rounded-full bg-secondary hover:bg-secondary/90 shadow-lg"
                aria-label="Open HealthBot"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md w-[90vw]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  HealthBot Assistant
                </SheetTitle>
                <SheetDescription>
                  Ask me anything about diseases, symptoms, or health advice.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 flex flex-col h-[80vh]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4 bg-gray-50 rounded-md">
                  {botHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Bot className="h-16 w-16 mb-4 opacity-20" />
                      <p>Ask me a health-related question to get started</p>
                    </div>
                  ) : (
                    botHistory.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex gap-2 items-start">
                          <div className="bg-primary text-white p-2 rounded-full h-7 w-7 flex items-center justify-center text-xs">
                            You
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                            {item.question}
                          </div>
                        </div>
                        <div className="flex gap-2 items-start">
                          <div className="bg-secondary text-white p-2 rounded-full h-7 w-7 flex items-center justify-center text-xs">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="bg-secondary/10 rounded-lg p-3 max-w-[85%]">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isBotLoading && (
                    <div className="flex justify-center">
                      <div className="animate-pulse text-gray-500">HealthBot is thinking...</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about a health condition..."
                    value={botQuestion}
                    onChange={e => setBotQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAskBot()}
                    className="flex-1"
                    disabled={isBotLoading}
                  />
                  <Button 
                    onClick={handleAskBot} 
                    disabled={isBotLoading || !botQuestion.trim()}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Original HealthBot Card - Can be kept for users who prefer the inline version */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              HealthBot - Disease Q&A
            </CardTitle>
            <CardDescription>
              Ask any question about diseases, symptoms, or health advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask HealthBot about a disease, symptom, or condition..."
                  value={botQuestion}
                  onChange={e => setBotQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskBot()}
                  className="flex-1"
                  disabled={isBotLoading}
                />
                <Button 
                  type="button" 
                  onClick={handleAskBot} 
                  disabled={isBotLoading || !botQuestion.trim()}
                >
                  {isBotLoading ? "Asking..." : "Ask"}
                </Button>
              </div>
              {botAnswer && (
                <div className="p-3 rounded bg-gray-100 text-gray-700 mt-2">
                  {botAnswer}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
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
                      {hospitals.map((hospital) => (
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
                      {specializations.map((spec) => (
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
