import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Copy, Coffee, Table, Check, Sparkles, Calculator, Brain, Rocket } from 'lucide-react';
import { genAI } from '@/lib/gemini';

const SupportBox = () => (
  <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 mb-8">
    <div className="text-center space-y-4">
      <Coffee className="h-12 w-12 mx-auto text-green-500" />
      <h2 className="text-2xl font-bold">Support Our Work ❤️</h2>
      <p className="text-gray-600 max-w-xl mx-auto">
        Help us maintain and improve our AI tools by supporting our API & hosting costs. 
        Your contribution helps keep this tool free for everyone! 🙏
      </p>
      <a
        href="https://roihacks.gumroad.com/coffee"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Button 
          size="lg" 
          className="text-lg px-8 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
        >
          <Coffee className="mr-2 h-5 w-5" />
          Buy Us a Coffee ☕
        </Button>
      </a>
    </div>
  </Card>
);

export default function Home() {
  const [description, setDescription] = useState('');
  const [formula, setFormula] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFormula = async () => {
    if (!description.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      if (!genAI) {
        throw new Error("API key not configured. Please add your Gemini API key to continue.");
      }
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate a Google Sheets formula based on this requirement: ${description}. 
      Format your response exactly like this, including the exact headers:

      FORMULA:
      [The exact Google Sheets formula, nothing else]

      EXPLANATION:
      [A clear, step-by-step explanation of how the formula works, with each step on a new line starting with a number and a dot]`;
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const formulaMatch = response.match(/FORMULA:\s*\n*(.*?)(?=\s*\n*EXPLANATION:)/s);
      const explanationMatch = response.match(/EXPLANATION:\s*\n*(.*)/s);
      
      if (formulaMatch && explanationMatch) {
        const rawFormula = formulaMatch[1].trim();
        const cleanFormula = rawFormula.replace(/^[`']\s*|\s*[`']$/g, '').trim();
        setFormula(cleanFormula);
        setExplanation(explanationMatch[1].trim());
      } else {
        throw new Error('Failed to parse AI response correctly');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the Google Sheets formula');
      setFormula('');
      setExplanation('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 py-4">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text leading-tight">
            AI Google Sheets Formula Generator ✨
          </h1>
          <p className="text-xl text-gray-600">
            Generate powerful Google Sheets formulas in seconds! 🚀
          </p>
        </div>
        
        <div className="gradient-border mb-8">
          <div className="p-8">
            <div className="space-y-6">
              <Textarea
                placeholder="✍️ Describe what you want your Google Sheets formula to do..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] text-lg border-2 focus:border-green-400"
              />
              
              <Button 
                onClick={generateFormula}
                disabled={loading || !description.trim()}
                className="w-full text-lg py-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Generating Formula...
                  </>
                ) : (
                  <>
                    <Table className="mr-2 h-5 w-5" />
                    Generate Formula ✨
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {formula && (
          <div className="space-y-6 mb-12">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Formula</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 hover:bg-green-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm">
                  {formula}
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
              <h3 className="text-lg font-semibold mb-4">Explanation</h3>
              <div className="prose prose-green max-w-none">
                {explanation.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </Card>
          </div>
        )}

        <SupportBox />

        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 mb-16">
          <article className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-transparent bg-clip-text">
              Free Google Sheets Formula Generator: Create Perfect Formulas in Seconds ⚡
            </h2>
            
            <div className="space-y-8">
              <p className="text-gray-600 leading-relaxed">
                Need help with Google Sheets formulas? Our free AI-powered formula generator combines
                advanced artificial intelligence with spreadsheet expertise to help you create
                powerful, accurate formulas for any spreadsheet task.
              </p>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-green-500" />
                  Why Choose Our Google Sheets Formula Generator? 🎯
                </h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">🚀</span>
                    <span>Instant generation of accurate Google Sheets formulas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🤖</span>
                    <span>AI-powered technology that understands your needs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">📊</span>
                    <span>Clear explanations for every formula</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">💡</span>
                    <span>Perfect for beginners and advanced users alike</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✨</span>
                    <span>Free to use with professional-quality results</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-green-500" />
                  Comprehensive Formula Support 📊
                </h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• Mathematical and Statistical Functions</li>
                  <li>• Text and String Manipulation</li>
                  <li>• Date and Time Calculations</li>
                  <li>• Lookup and Reference Functions</li>
                  <li>• Conditional Formatting Formulas</li>
                  <li>• Array Formulas and QUERY Functions</li>
                  <li>• Financial Calculations</li>
                  <li>• Data Validation Rules</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-green-500" />
                  Advanced Features for Power Users 🚀
                </h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• Complex Nested Functions</li>
                  <li>• Array Formulas (CSE Formulas)</li>
                  <li>• Custom Functions</li>
                  <li>• Advanced QUERY Language</li>
                  <li>• Regular Expressions</li>
                  <li>• Dynamic Arrays</li>
                  <li>• Pivot Table Formulas</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4">
                  Perfect for Every Spreadsheet Need 📈
                </h2>
                <p className="text-gray-600 mb-4">
                  Our Google Sheets formula generator is designed to help with a wide range of spreadsheet tasks:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Financial Analysis and Reporting</li>
                  <li>• Data Analysis and Statistics</li>
                  <li>• Project Management Tracking</li>
                  <li>• Inventory Management</li>
                  <li>• Sales and Revenue Calculations</li>
                  <li>• HR and Employee Management</li>
                  <li>• Educational Grading Systems</li>
                  <li>• Personal Finance Management</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4">
                  How to Get the Most Out of Our Formula Generator 💡
                </h2>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                  <li>Be specific about your formula requirements</li>
                  <li>Include example data formats when relevant</li>
                  <li>Specify any conditions or criteria</li>
                  <li>Mention if you need error handling</li>
                  <li>Ask for specific Google Sheets functions if you know them</li>
                </ol>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold mb-4">
                  Why Google Sheets Formulas Matter 🎯
                </h2>
                <p className="text-gray-600">
                  Google Sheets formulas are essential tools for data analysis, automation, and efficient spreadsheet management. They help you:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li>• Automate repetitive calculations</li>
                  <li>• Ensure data accuracy and consistency</li>
                  <li>• Save time on manual data processing</li>
                  <li>• Create dynamic reports and dashboards</li>
                  <li>• Handle complex data analysis tasks</li>
                  <li>• Improve productivity and efficiency</li>
                </ul>
              </div>
            </div>
          </article>
        </div>

        <SupportBox />
      </div>
    </div>
  );
}