import React, { useState, useEffect, useRef } from 'react';
import { Banner } from '../../types';
import { Upload } from 'lucide-react';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: Banner) => void;
  initialData?: Banner | null;
}

export default function BannerModal({ isOpen, onClose, onSave, initialData }: BannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
    imageUrl: '',
    link: '',
    title: '',
    subtitle: '',
    type: 'hero'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        imageUrl: '',
        link: '',
        title: '',
        subtitle: '',
        type: 'hero'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now().toString(),
      imageUrl: formData.imageUrl || '',
      link: formData.link || '',
      title: formData.title || '',
      subtitle: formData.subtitle || '',
      type: (formData.type as 'hero' | 'sub') || 'hero'
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Sửa Banner' : 'Thêm Banner'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề phụ</label>
            <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hình ảnh</label>
            <div className="flex gap-2">
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="flex-1 border rounded p-2" placeholder="URL hoặc tải ảnh lên" required />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 flex items-center"
              >
                <Upload size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            {formData.imageUrl && (
              <div className="mt-2 w-full h-32 border rounded overflow-hidden">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đường dẫn (Link)</label>
            <input type="text" name="link" value={formData.link} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loại Banner</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded p-2">
              <option value="hero">Banner chính (Hero)</option>
              <option value="sub">Banner phụ (Sub)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-[#00483d] text-white rounded hover:bg-[#00382f]">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
