'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getFirstAccessiblePage } from '@/lib/navigation';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const descriptions = [
  "Data without analysis is just noise. Turning raw numbers into meaningful insights fuels better decisions and innovation.",
  "The power of data lies not just in collecting it, but in how we analyze and represent it. Clear visualization turns complexity into clarity.",
  "Good decisions start with great data. Effective analysis and representation transform information into action and drive success."
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  const { login, user, checkAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to their first accessible page
    if (user) {
      const redirectPath = getFirstAccessiblePage(checkAccess);
      // Use window.location for a full page refresh to ensure proper state initialization
      window.location.href = redirectPath;
    }
  }, [user, checkAccess]);

  useEffect(() => {
    // Rotate through descriptions every 5 seconds
    const interval = setInterval(() => {
      setCurrentDescriptionIndex((prevIndex) => 
        prevIndex === descriptions.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Login successful');
        const redirectPath = getFirstAccessiblePage(checkAccess);
        // Use window.location for a full page refresh to ensure proper state initialization
        window.location.href = redirectPath;
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-pattern.svg')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-6xl relative z-10 overflow-hidden flex flex-col md:flex-row rounded-3xl shadow-[0_20px_50px_rgba(0,_0,_0,_0.5)]">
        {/* Left side - Logo and animated descriptions */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] p-8 flex flex-col justify-between backdrop-blur-md bg-opacity-80 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex justify-center items-center h-80 mt-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-full filter blur-md transform scale-110"></div>
              <Image 
                src="/logo.png" 
                alt="Company Logo" 
                width={450} 
                height={450} 
                className="object-contain relative z-10"
              />
            </div>
          </div>
          
          <div className="mt-8 relative z-10">
            <div className="h-32 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDescriptionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <p className="text-white text-lg font-light leading-relaxed">
                    {descriptions[currentDescriptionIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex space-x-2 mt-4 justify-center">
              {descriptions.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentDescriptionIndex === index 
                      ? 'w-8 bg-white' 
                      : 'w-4 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-white/70 text-sm relative z-10">
            &copy; 2025 PixWingAI. All rights reserved.
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="max-w-md mx-auto relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-green-300 mb-10">Please sign in to your account</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-green-400 focus:ring-green-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-green-400 focus:ring-green-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-white/70 hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="border-white/50 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none text-white"
                >
                  I agree to the <span className="text-green-300 hover:text-green-200 hover:underline cursor-pointer">Terms and Conditions</span>
                </label>
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-2 rounded-md shadow-lg hover:shadow-xl transition-all duration-300">
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
