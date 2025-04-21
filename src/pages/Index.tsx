import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { Bot } from 'lucide-react';
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
import { askHealthBot, saveToHistory } from '@/utils/healthBot';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [botQuestion, setBotQuestion] = useState('');
  const [botAnswer, setBotAnswer] = useState('');
  const [isBotLoading, setIsBotLoading] = useState(false);
  const [botHistory, setBotHistory] = useState<{question: string, answer: string}[]>([]);

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
    <div className="min-h-screen bg-health-green">
      <div className="health-container py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-health-dark">Welcome to HealthHub</h1>
          
          <div className="bg-white rounded-lg p-8 mb-10 shadow-md max-w-xl mx-auto">
            <img 
              src="/lovable-uploads/4bc3c0bc-8d82-4963-bc2a-7b3436b9dad4.png" 
              alt="HealthHub Logo" 
              className="health-logo mx-auto" 
            />
          </div>
          
          <p className="text-xl text-health-dark mb-6">
            HealthHub is your one-stop destination for all your healthcare needs. Chat with doctors, book appointments, manage your profile, and more!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2 text-lg">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-primary hover:bg-primary/80 text-white px-6 py-2 text-lg">
                    Register
                  </Button>
                </Link>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2 text-lg"
                      aria-label="Open HealthBot"
                    >
                      <Bot className="mr-2 h-5 w-5" />
                      Try HealthBot
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
                          <Bot className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                {user?.role === 'user' && (
                  <>
                    <Link to="/chat">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        Chat with a Doctor
                      </Button>
                    </Link>
                    <Link to="/appointment">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        Book an Appointment
                      </Button>
                    </Link>
                    <Link to="/xray">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        XRayVision
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                        Manage Your Profile
                      </Button>
                    </Link>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                          <Bot className="mr-2 h-5 w-5" />
                          Ask HealthBot
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
                              <Bot className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </>
                )}
                {user?.role === 'doctor' && (
                  <Link to="/doctor">
                    <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                      Go to Doctor Dashboard
                    </Button>
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button className="bg-secondary hover:bg-secondary/80 text-white px-6 py-2">
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed HealthBot button for all users */}
      {!isAuthenticated && (
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
                    <Bot className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};

export default Index;
