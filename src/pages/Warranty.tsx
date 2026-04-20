import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Warranty() {
  const settings = useSettingsStore(state => state.settings);

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm min-h-[500px]">
      <div 
        className="prose max-w-none prose-green"
        dangerouslySetInnerHTML={{ __html: settings.warrantyPolicy || '<h2>Chính sách bảo hành</h2><p>Đang cập nhật nội dung chính sách bảo hành...</p>' }}
      />
    </div>
  );
}
