import React from 'react';


const Circle = ({ id, size, position, isSelected }) => {
    return (
      <div
        id={id}
        className={`circle ${isSelected ? 'selected' : ''}`} //
        style={{
          width: `${size}px`,  // Устанавливаем ширину 
          height: `${size}px`, //  И высоту круга
          left: `${position.x}px`, // Устанавливаем положение круга по осям Х и У
          top: `${position.y}px`,  
        }}
      />
    );
  };

export default Circle;
