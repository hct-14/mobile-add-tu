import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({ children, className }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Load before it comes into view
  });

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      ) : (
        <div style={{ height: '300px' }} /> // Placeholder height
      )}
    </div>
  );
};
