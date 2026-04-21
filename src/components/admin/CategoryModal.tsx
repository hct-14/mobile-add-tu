import React, { useState, useEffect } from 'react';
import { Category } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  initialData?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, initialData }: CategoryModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = formData.slug || (formData.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    onSave({
      id: initialData?.id || Date.now().toString(),
      name: formData.name || '',
      slug: slug,
      description: formData.description || '',
      icon: formData.icon || '📁'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Sửa Danh mục' : 'Thêm Danh mục'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên danh mục</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full border rounded p-2" placeholder="De-trong-de-tu-tao" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon (Emoji hoặc Ảnh URL)</label>
              <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="w-full border rounded p-2" placeholder="📱" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả (Tùy chọn)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" rows={3} />
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
