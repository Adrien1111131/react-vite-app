import React from 'react';

const Logo = ({ className }) => {
  return (
    <img 
      src="https://i.postimg.cc/X78sNXhD/1000054051-removebg-preview.png"
      alt="Logo"
      className={className}
      style={{
        filter: 'drop-shadow(0 0 3px rgba(255, 107, 0, 0.3))',
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

export default Logo;
