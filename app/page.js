import Link from 'next/link';
import { FaFileAlt, FaBrain, FaRocket, FaCheck } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaFileAlt className="text-primary-600 text-2xl" />
            <span className="text-2xl font-bold text-gradient">CVRAX</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="btn btn-outline">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container-custom py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Create{' '}
            <span className="text-gradient">Professional CVs</span>
            <br />
            Powered by LaTeX & AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build ATS-friendly resumes with beautiful LaTeX templates, 
            optimize them for any job description using AI, and land your dream job.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-3">
              Start Creating Free
            </Link>
            <Link href="#features" className="btn btn-outline text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <FaCheck className="text-green-500" />
              <span>Free LaTeX Templates</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheck className="text-green-500" />
              <span>AI Optimization</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaCheck className="text-green-500" />
              <span>ATS Compatible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose CVRAX?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional CV creation made simple with enterprise-grade features
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-hover text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaFileAlt className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">LaTeX Templates</h3>
              <p className="text-gray-600">
                Professional templates powered by LaTeX, used by academics and professionals worldwide.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card card-hover text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBrain className="text-3xl text-accent-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Optimization</h3>
              <p className="text-gray-600">
                Upload a job description and let AI customize your CV to match perfectly.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card card-hover text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaRocket className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Generation</h3>
              <p className="text-gray-600">
                Generate beautiful PDFs in seconds. Download and start applying immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to your perfect CV</p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Create Your Profile</h3>
                <p className="text-gray-600">
                  Sign in with Google and fill in your experience, education, skills, and projects.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Choose a Template</h3>
                <p className="text-gray-600">
                  Select from our collection of professional LaTeX templates designed for different industries.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Optimize with AI</h3>
                <p className="text-gray-600">
                  Upload a job description and let our AI customize your CV to match the requirements perfectly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create Your Perfect CV?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of job seekers who are landing interviews with CVRAX
          </p>
          <Link href="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-10 py-4 inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaFileAlt className="text-primary-500 text-2xl" />
            <span className="text-2xl font-bold text-white">CVRAX</span>
          </div>
          <p className="mb-4">Professional CV generation powered by LaTeX & AI</p>
          <p className="text-sm">© 2026 CVRAX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
