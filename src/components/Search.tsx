import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { mockProducts } from '../data/mockProducts';
import Fuse from 'fuse.js';

export default function SearchComponent({ isMobile = false }: { isMobile?: boolean }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fuse = useMemo(() => new Fuse(mockProducts, {
    keys: ['name', 'category', 'brand'],
    threshold: 0.3,
  }), []);

  const suggestions = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map(result => result.item).slice(0, 5);
  }, [query, fuse]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className={isMobile ? 'relative' : 'relative w-full'} ref={searchRef}>
      <input
        type="text"
        placeholder="Hôm nay bạn cần tìm gì?"
        className={`w-full py-2 px-4 pr-10 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${isMobile ? '' : ''}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      <button 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        onClick={handleSearch}
      >
        <Search size={20} />
      </button>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-900"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
            >
              <img src={product.image} alt={product.name} loading="lazy" className="w-10 h-10 object-cover rounded mr-3" />
              <span className="text-sm">{product.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
