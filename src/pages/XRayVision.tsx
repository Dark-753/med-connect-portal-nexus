
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, UploadCloud, FilePlus2, Scan, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const XRayVision = () => {
  const [activeTab, setActiveTab] = useState('brain');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    detected: boolean;
    confidence: number;
    details: string;
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset results
    setResults(null);
  };

  const analyzeImage = () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis with a timeout
    setTimeout(() => {
      // Mock results based on the active tab
      if (activeTab === 'brain') {
        setResults({
          detected: Math.random() > 0.5, // Random result for demo
          confidence: Math.random() * 100,
          details: 'AI analysis complete. This is a simulated result for a brain tumor analysis. In a production environment, this would use a real AI model to analyze the brain scan for tumors.',
        });
      } else {
        setResults({
          detected: Math.random() > 0.5, // Random result for demo
          confidence: Math.random() * 100,
          details: 'AI analysis complete. This is a simulated result for a skin disease analysis. In a production environment, this would use a real AI model to analyze the skin condition.',
        });
      }
      
      setIsAnalyzing(false);
      
      toast({
        title: 'Analysis Complete',
        description: 'The AI has finished analyzing the image',
      });
    }, 3000);
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <div className="flex items-center mb-6">
          <Scan className="text-primary mr-2 h-6 w-6" />
          <h1 className="text-3xl font-bold text-health-dark">XRayVision - AI Medical Analysis</h1>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Medical Image Analysis</h2>
          <p className="text-gray-600">
            Upload medical images for AI-powered detection of brain tumors and skin diseases. This tool provides preliminary analysis and is not a substitute for professional medical diagnosis.
          </p>
        </div>
        
        <Tabs defaultValue="brain" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="brain" className="flex items-center justify-center">
              <Brain className="mr-2 h-5 w-5" /> Brain Tumor Detection
            </TabsTrigger>
            <TabsTrigger value="skin" className="flex items-center justify-center">
              <FilePlus2 className="mr-2 h-5 w-5" /> Skin Disease Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="brain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Brain Tumor Detection</CardTitle>
                <CardDescription>
                  Upload an MRI or CT scan image to detect potential brain tumors using AI analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-4">
                    {!imagePreview ? (
                      <label 
                        htmlFor="brain-upload" 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                      >
                        <UploadCloud className="h-16 w-16 text-gray-400 mb-2" />
                        <span className="text-gray-500 text-center">
                          Click to upload or drag and drop<br />
                          <span className="text-sm">SVG, PNG, JPG or GIF (max. 10MB)</span>
                        </span>
                        <input 
                          id="brain-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Brain scan preview" 
                          className="w-full h-auto rounded-lg max-h-[400px] object-contain bg-black"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                          onClick={resetAnalysis}
                        >
                          Change Image
                        </Button>
                      </div>
                    )}
                    
                    {selectedFile && !isAnalyzing && !results && (
                      <Button onClick={analyzeImage} className="w-full">
                        <Scan className="mr-2 h-4 w-4" /> Analyze Brain Scan
                      </Button>
                    )}
                    
                    {isAnalyzing && (
                      <Button disabled className="w-full">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                      </Button>
                    )}
                  </div>
                  
                  {results && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Analysis Results
                          <Badge className={results.detected ? "bg-red-500" : "bg-green-500"}>
                            {results.detected ? "Tumor Detected" : "No Tumor Detected"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Confidence Score</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                              <div 
                                className={`h-2.5 rounded-full ${results.detected ? "bg-red-500" : "bg-green-500"}`} 
                                style={{ width: `${results.confidence.toFixed(1)}%` }}
                              ></div>
                            </div>
                            <p className="text-right text-xs text-gray-500 mt-1">
                              {results.confidence.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Analysis Details</p>
                            <p className="text-sm text-gray-500 mt-1">{results.details}</p>
                          </div>
                          <div className="pt-4">
                            <p className="text-xs text-gray-400 italic">
                              Note: This AI analysis is for demonstration purposes only and should not replace professional medical diagnosis.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" onClick={resetAnalysis} className="w-full">
                          Start New Analysis
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skin Disease Analysis</CardTitle>
                <CardDescription>
                  Upload a clear image of the affected skin area for AI-powered disease detection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-4">
                    {!imagePreview ? (
                      <label 
                        htmlFor="skin-upload" 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                      >
                        <UploadCloud className="h-16 w-16 text-gray-400 mb-2" />
                        <span className="text-gray-500 text-center">
                          Click to upload or drag and drop<br />
                          <span className="text-sm">SVG, PNG, JPG or GIF (max. 10MB)</span>
                        </span>
                        <input 
                          id="skin-upload" 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Skin condition preview" 
                          className="w-full h-auto rounded-lg max-h-[400px] object-contain bg-black"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                          onClick={resetAnalysis}
                        >
                          Change Image
                        </Button>
                      </div>
                    )}
                    
                    {selectedFile && !isAnalyzing && !results && (
                      <Button onClick={analyzeImage} className="w-full">
                        <Scan className="mr-2 h-4 w-4" /> Analyze Skin Condition
                      </Button>
                    )}
                    
                    {isAnalyzing && (
                      <Button disabled className="w-full">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                      </Button>
                    )}
                  </div>
                  
                  {results && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Analysis Results
                          <Badge className={results.detected ? "bg-orange-500" : "bg-green-500"}>
                            {results.detected ? "Condition Detected" : "No Condition Detected"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Confidence Score</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                              <div 
                                className={`h-2.5 rounded-full ${results.detected ? "bg-orange-500" : "bg-green-500"}`} 
                                style={{ width: `${results.confidence.toFixed(1)}%` }}
                              ></div>
                            </div>
                            <p className="text-right text-xs text-gray-500 mt-1">
                              {results.confidence.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Analysis Details</p>
                            <p className="text-sm text-gray-500 mt-1">{results.details}</p>
                          </div>
                          <div className="pt-4">
                            <p className="text-xs text-gray-400 italic">
                              Note: This AI analysis is for demonstration purposes only and should not replace professional medical diagnosis.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" onClick={resetAnalysis} className="w-full">
                          Start New Analysis
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default XRayVision;
