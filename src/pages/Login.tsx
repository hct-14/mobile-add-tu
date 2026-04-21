import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check email verification
      if (!userCredential.user.emailVerified) {
        toast.error('Vui lòng xác minh email trước khi đăng nhập!');
        setLoading(false);
        return;
      }
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      toast.error('Sai email hoặc mật khẩu!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      // Create user doc if not exists
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || 'Google User',
          email: userCredential.user.email || '',
          role: (userCredential.user.email === 'admin@hoangha.com' || userCredential.user.email === 'hoangthanhgolle@gmail.com' || userCredential.user.email === 'alostore6688@gmail.com' || userCredential.user.email === 'admin@gmail.com') ? 'admin' : 'user'
        });
      }
      toast.success('Đăng nhập với Google thành công!');
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Lỗi: Tên miền chưa được cấp phép trong Firebase!');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Lỗi: Chưa bật đăng nhập Google trong Firebase!');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Bạn đã đóng cửa sổ đăng nhập.');
      } else {
        toast.error(`Lỗi Google: ${error.message}`);
      }
      console.error("Lỗi đăng nhập Google:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Vui lòng nhập email để khôi phục mật khẩu');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi email khôi phục. Vui lòng kiểm tra lại email.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8 mt-10 mb-20">
      <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
            placeholder="Nhập email"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
            placeholder="Nhập mật khẩu"
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 text-[#00483d] focus:ring-[#00483d]" />
            Ghi nhớ
          </label>
          <button type="button" onClick={handleForgotPassword} className="text-[#00483d] hover:underline">Quên mật khẩu?</button>
        </div>
        
        <button 
          type="submit"
          className="w-full bg-[#00483d] text-white font-bold py-2.5 rounded-md hover:bg-[#00382f] transition-colors mt-4 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'ĐANG THEO DÕI...' : 'ĐĂNG NHẬP'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <hr className="w-full border-gray-300" />
        <span className="p-2 text-gray-400 text-sm">HOẶC</span>
        <hr className="w-full border-gray-300" />
      </div>

      <button 
        onClick={handleGoogleLogin}
        className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2.5 rounded-md hover:bg-gray-50 flex items-center justify-center transition-colors disabled:bg-gray-100"
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Đăng nhập với Google
      </button>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Bạn chưa có tài khoản? <Link to="/register" className="text-[#00483d] font-medium hover:underline">Đăng ký ngay</Link>
      </div>
      <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-md">
        <p className="font-bold mb-1">Cảnh báo:</p>
        <p>Vui lòng kích hoạt Email/Password trong Firebase Console để đăng ký bằng email.</p>
        <p>Để trở thành admin, bạn cần dùng tài khoản email "hoangthanhgolle@gmail.com" hoặc "alostore6688@gmail.com".</p>
      </div>
    </div>
  );
}
