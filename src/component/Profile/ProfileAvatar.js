import React from 'react';

const ProfileAvatar = ({ 
  image, 
  name, 
  size = 'large', 
  showBorder = true,
  showInitials = true,
  className = '' 
}) => {
  const getInitials = () => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-lg',
    large: 'w-24 h-24 text-3xl',
    xlarge: 'w-32 h-32 text-4xl'
  };

  const borderClasses = showBorder ? 'border-4 border-white shadow-lg' : '';

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 ${borderClasses} ${className}`}>
      {image ? (
        <img
          src={image}
          alt={`${name}'s profile`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image and initials div if image fails to load
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'none';
            }
          }}
        />
      ) : null}
      
      {showInitials && !image && (
        <div 
          className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white"
        >
          {getInitials()}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;