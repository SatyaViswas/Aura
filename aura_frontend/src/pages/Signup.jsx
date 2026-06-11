import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useHealthStore from '../store/healthStore';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const signUpWithEmail = useHealthStore((state) => state.signUpWithEmail);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Front-end structural verification check
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await signUpWithEmail(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = "Registration failed. Please try again later.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "That email address is already registered.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#FFFFFF] p-10 md:p-12 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(42,42,42,0.08)]"
      >
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-light text-text-primary tracking-tight">Create Profile</h1>
          <p className="text-text-secondary font-light">Join the platform to unlock your holistic dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FDE8E8] text-text-primary rounded-xl text-sm text-center font-light border border-[#FBCFE8]/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              disabled={isLoading}
              className="w-full px-5 py-4 bg-background border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]/20 focus:border-[#4A6B5D] text-text-primary transition-all font-light placeholder:text-[#9CA3AF] disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              disabled={isLoading}
              className="w-full px-5 py-4 bg-background border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]/20 focus:border-[#4A6B5D] text-text-primary transition-all font-light placeholder:text-[#9CA3AF] disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose Password"
              disabled={isLoading}
              className="w-full px-5 py-4 bg-background border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]/20 focus:border-[#4A6B5D] text-text-primary transition-all font-light placeholder:text-[#9CA3AF] disabled:opacity-50"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-[#4A6B5D] text-white rounded-xl shadow-[0_10px_30px_-10px_rgba(74,107,93,0.4)] hover:bg-opacity-90 hover:scale-[1.02] transition-all font-medium tracking-wide disabled:opacity-70 disabled:hover:scale-100 mt-6"
          >
            {isLoading ? 'Creating Profile...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="text-center mt-8">
          <Link to="/login" className="text-sm text-text-secondary hover:text-[#4A6B5D] transition-colors font-light">
            Already have an account? <span className="font-medium text-[#4A6B5D]">Sign in here</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
