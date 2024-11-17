import { motion } from 'framer-motion';

interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
}

export default function Avatar({ src, alt = "Profile", size = 40 }: AvatarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="relative"
    >
      <div className="rounded-full p-[2px] bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="rounded-full p-[2px] bg-white">
          <img
            src={src}
            alt={alt}
            style={{ width: size, height: size }}
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}