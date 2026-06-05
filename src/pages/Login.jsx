import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useHealthStore from '../store/healthStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loginWithEmail = useHealthStore((state) => state.loginWithEmail);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = "An error occurred during login. Please try again.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        errorMessage = "We couldn't find an account matching that email.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "The password provided is incorrect.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FBFBF9]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#FFFFFF] p-10 md:p-12 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(42,42,42,0.08)]"
      >
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl font-light text-[#2A2A2A] tracking-tight">Welcome Back</h1>
          <p className="text-[#767676] font-light">Enter your credentials to continue your journey.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FDE8E8] text-[#2A2A2A] rounded-xl text-sm text-center font-light border border-[#FBCFE8]/50">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              disabled={isLoading}
              className="w-full px-5 py-4 bg-[#FBFBF9] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]/20 focus:border-[#4A6B5D] text-[#2A2A2A] transition-all font-light placeholder:text-[#9CA3AF] disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              className="w-full px-5 py-4 bg-[#FBFBF9] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A6B5D]/20 focus:border-[#4A6B5D] text-[#2A2A2A] transition-all font-light placeholder:text-[#9CA3AF] disabled:opacity-50"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-[#4A6B5D] text-white rounded-xl shadow-[0_10px_30px_-10px_rgba(74,107,93,0.4)] hover:bg-opacity-90 hover:scale-[1.02] transition-all font-medium tracking-wide disabled:opacity-70 disabled:hover:scale-100 mt-4"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center mt-8">
          <Link to="/signup" className="text-sm text-[#767676] hover:text-[#4A6B5D] transition-colors font-light">
            New to the workspace? <span className="font-medium text-[#4A6B5D]">Sign up here</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
