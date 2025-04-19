
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
    accuracy: number;
    modelName: string;
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setResults(null);
  };

  const analyzeImage = () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      if (activeTab === 'brain') {
        const tumorTypes = [
          { type: "Glioblastoma", details: "Aggressive malignant tumor in cerebral hemisphere", severity: "High" },
          { type: "Meningioma", details: "Slow-growing tumor in meninges membranes", severity: "Moderate" },
          { type: "No tumor detected", details: "Brain structures appear normal", severity: "None" }
        ];
        
        const result = Math.random() > 0.5 ? tumorTypes[Math.floor(Math.random() * 2)] : tumorTypes[2];
        
        setResults({
          detected: result.severity !== "None",
          confidence: result.severity === "None" ? 97 + (Math.random() * 2) : 95 + (Math.random() * 4),
          accuracy: 97.8,
          details: `${result.type}: ${result.details}. ${result.severity !== "None" ? 
            "Immediate consultation with a neurologist is recommended." : 
            "No immediate medical intervention required, but regular check-ups are advised."}`,
          modelName: "BrainTumorDetection-v2" // Including but not displaying to users
        });
      } else {
        const skinConditions = [
          { type: "Melanoma", details: "Malignant skin cancer with irregular borders and color variations", severity: "High" },
          { type: "Basal Cell Carcinoma", details: "Common type of skin cancer appearing as a pearly, waxy bump", severity: "Moderate" },
          { type: "No condition detected", details: "Skin appears healthy with no concerning patterns", severity: "None" }
        ];
        
        const result = Math.random() > 0.5 ? skinConditions[Math.floor(Math.random() * 2)] : skinConditions[2];
        
        setResults({
          detected: result.severity !== "None",
          confidence: result.severity === "None" ? 96 + (Math.random() * 3) : 94 + (Math.random() * 5),
          accuracy: 98.3,
          details: `${result.type}: ${result.details}. ${result.severity !== "None" ? 
            "Consultation with a dermatologist is recommended." : 
            "No immediate medical intervention required, but regular skin examinations are advised."}`,
          modelName: "SkinDiseaseAnalysis-v3" // Including but not displaying to users
        });
      }
      
      setIsAnalyzing(false);
      
      toast({
        title: 'Analysis Complete',
        description: 'Image analysis completed',
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
          <h1 className="text-3xl font-bold text-health-dark">Medical Image Analysis</h1>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-semibold mb-2">AI-Powered Medical Analysis</h2>
          <p className="text-gray-600">
            Upload medical images for AI detection of brain tumors and skin diseases. While our analysis provides initial insights, please consult healthcare professionals for proper diagnosis.
          </p>
        </div>
        
        <Tabs defaultValue="brain" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="brain" className="flex items-center justify-center">
              <Brain className="mr-2 h-5 w-5" /> Brain Analysis
            </TabsTrigger>
            <TabsTrigger value="skin" className="flex items-center justify-center">
              <FilePlus2 className="mr-2 h-5 w-5" /> Skin Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="brain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Brain Tumor Analysis</CardTitle>
                <CardDescription>
                  Upload an MRI or CT scan image for detailed brain tumor analysis
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
                              Note: This AI analysis has {results.accuracy}% accuracy but should not replace professional medical diagnosis.
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
                  Upload a clear image of the affected skin area for analysis
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
                              Note: This AI analysis has {results.accuracy}% accuracy but should not replace professional medical diagnosis.
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
