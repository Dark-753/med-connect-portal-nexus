
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, FileSearch, User, Bot } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const { user } = useAuth();
  const [botQuestion, setBotQuestion] = useState('');
  const [botAnswer, setBotAnswer] = useState('');
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [botHistory, setBotHistory] = useState<{question: string, answer: string}[]>([]);

  async function handleAskBot() {
    if (!botQuestion.trim()) return;
    setIsBotLoading(true);
    setBotAnswer('');

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer pk-lovable-demo`, // Replace with your Perplexity API key for production!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            { role: 'system', content: 'You are an empathetic healthcare assistant. Respond only with clear, concise, medically accurate advice and answers regarding diseases, symptoms, and health conditions.' },
            { role: 'user', content: botQuestion }
          ],
          temperature: 0.2,
          max_tokens: 300
        })
      });
      if (!response.ok) {
        setBotAnswer('Sorry, I was unable to answer your question at this time.');
        setIsBotLoading(false);
        return;
      }
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || 'Sorry, I could not find an answer.';
      
      // Save to history
      setBotHistory(prev => [...prev, {question: botQuestion, answer}]);
      setBotAnswer(answer);
    } catch (err) {
      setBotAnswer('Sorry, there was an error contacting HealthBot.');
    }
    setIsBotLoading(false);
  }

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
                <Bot className="mr-2 h-5 w-5 text-primary" />
                HealthBot Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about health conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Get instant AI-powered answers about diseases, symptoms, medications, and general health advice.
              </p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="w-full bg-secondary hover:bg-secondary/80">
                    <Bot className="mr-2 h-4 w-4" />
                    Open HealthBot
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-md">
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
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
          
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Dashboard;
