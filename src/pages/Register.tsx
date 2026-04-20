import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Check duplicate username now that we are authenticated
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        await userCredential.user.delete();
        toast.error('Tên tài khoản (username) đã tồn tại!');
        setLoading(false);
        return;
      }
      
      // Save info to firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        name: fullName,
        username,
        dob,
        email,
        role: 'user'
      });

      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Sign out since they need to verify to login
      await auth.signOut();

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản trước khi đăng nhập.');
      
      // Navigate to login
      navigate('/login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email này đã được sử dụng!');
      } else {
        toast.error('Đã xảy ra lỗi khi đăng ký! Hãy chắc chắn bạn đã kích hoạt Email/Password trong Firebase.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8 mt-10 mb-20">
      <h1 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản (Username)</label>
          <input 
            type="text" 
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
            placeholder="johndoe123"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input 
            type="text" 
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
            placeholder="Ví dụ: Nguyễn Văn A"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
          <input 
            type="date" 
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
            placeholder="email@example.com"
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
            placeholder="Ít nhất 6 ký tự"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input 
            type="password" 
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00483d]"
            placeholder="Nhập lại mật khẩu"
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-[#00483d] text-white font-bold py-2.5 rounded-md hover:bg-[#00382f] transition-colors mt-4 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Bạn đã có tài khoản? <Link to="/login" className="text-[#00483d] font-medium hover:underline">Đăng nhập</Link>
      </div>
    </div>
  );
}
