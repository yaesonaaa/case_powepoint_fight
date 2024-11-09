import React, { useState, useEffect } from 'react';
import Circle from './Circle';
import '../App.css';

const getRandomPosition = (maxWidth, maxHeight) => {
  //предоствращаем выход круга за пределы слайда
    const x = Math.random() * (maxWidth - 50); 
    const y = Math.random() * (maxHeight - 50);
    return { x, y };
  };
  
  // Функция для получения случайного размера круга, возвращает случайное значение в диапазоне от 48 до 192
  const getRandomSize = () => {
    const minSize = 0.05 * 960; // 5% от 960px
    const maxSize = 0.2 * 960;   // 20% от 960px
    return Math.random() * (maxSize - minSize) + minSize; 
  };
  
  const Slide = () => {
    const [circles, setCircles] = useState([]); //массив кругов
    const [selectedCircleIds, setSelectedCircleIds] = useState(new Set()); //ID выделенных кругов
    const [isDragging, setIsDragging] = useState(false); //перетаскивание кружочка
    const [draggingOffsets, setDraggingOffsets] = useState(new Map()); //необходимо для учета смещения при перемещении кружочков
  
    //ДОБАВЛЕНИЕ КРУГА НА СЛАЙДИК
    const addCircle = () => {
      const size = getRandomSize();
      const position = getRandomPosition(960, 540);
      setCircles((prev) => [...prev, { id: Date.now(), size, position }]); //добавляем новый элемент и выдаем идентификатор
    };
  
    //УДАЛЕНИЕ КРУГА 
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        setCircles((prev) => prev.filter(circle => !selectedCircleIds.has(circle.id))); //фильтруем массив, возвращая в новый только те круги,ID которых нет в selectedCircleIds
        setSelectedCircleIds(new Set()); //убираем выделение
      }
    };
    
    // ПЕРЕМЕЩЕНИЕ КРУГА ПРИ ДВИЖЕНИИ МЫШИ
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newCircles = circles.map(circle => {
          if (selectedCircleIds.has(circle.id)) {
            const offset = draggingOffsets.get(circle.id);  //добавляем в состояние круги, которые мы выделили
            return {
              ...circle,
              position: {                         //расчитываем перемещение, вычитая из координат курсора мыши сохраненное смещение
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
              },
            };
          }
          return circle;
        });
        setCircles(newCircles);     //обновляем массив
      }
    };
  
    //СОБЫТИЯ НАЖАТИЯ КНОПКИ МЫШИ
    const handleMouseDown = (e) => {
      if (e.button === 2) { // ПКМ
        // Получаем ID цели и создаем набор кругов для выделения
        const clickedCircleId = parseInt(e.target.id);
        const newSelectedCircleIds = new Set(selectedCircleIds);
  
        if (newSelectedCircleIds.has(clickedCircleId)) {
          // Если круг уже выделен, убираем его из выделения
          newSelectedCircleIds.delete(clickedCircleId);
        } 
        else {
          // Если круг не выделен, добавляем его в выделение
          newSelectedCircleIds.add(clickedCircleId);
        }
  
        setSelectedCircleIds(newSelectedCircleIds); //обновляем состояние
      } else if (e.button === 0) { // ЛКМ
        const clickedCircleId = parseInt(e.target.id);
  
        // Проверяем, существует ли круг
        const clickedCircle = circles.find(circle => circle.id === clickedCircleId);
        if (clickedCircle) {
          if (selectedCircleIds.has(clickedCircleId)) {
            // Если кликнули по выделенному кругу, начинаем перетаскивание кружочка или группы
            const offsets = new Map();
            selectedCircleIds.forEach(id => {
              const circle = circles.find(c => c.id === id);  //находим выделенный круг по идентификатору, если поиск прошел успешно - перемещаем
              if (circle) {
                offsets.set(id, {   
                  x: e.clientX - circle.position.x,
                  y: e.clientY - circle.position.y,
                });
              }
            });
            setDraggingOffsets(offsets);
          } 
          else {
            
          // Если кликнули по невыделенному кругу, выделяем его и начинаем перетаскивание
          setSelectedCircleIds(new Set([clickedCircleId]));

          const offsets = new Map();
          offsets.set(clickedCircleId, {    //расчитываем перемещение, вычитая из координат курсора мыши сохраненное смещение
            x: e.clientX - clickedCircle.position.x,
            y: e.clientY - clickedCircle.position.y,
          });
          setDraggingOffsets(offsets);
        }
        setIsDragging(true);
      }
    }
  };

  //ПРЕДОТВРАЩАЕМ ПОЯВЛЕНИЕ КОНТЕКСТНОГО МЕНЮ ПРИ НАЖАТИИ ПКМ В ОБЛАСТИ ВНУТРИ СЛАЙДА
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // ПРИ ОТПУСКАНИИ МЫШИ ЗАВЕРШАЕМ ПЕРЕТАСКИВАНИЕ, ВОЗВРАЩАЕМ ЗНАЧЕНИЯ ПО УМОЛЧАНИЮ
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingOffsets(new Map());
  };


  //тут добавляем и удаляем обработчики событий, вызываем повторно в зависимости от состояний из массива
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [circles, selectedCircleIds, isDragging]);

  return (
    <div className='circle-container'>
      <button onClick={addCircle} className="button">Добавить круг</button>
      <div
         className="canvas"
      >
        {circles.map(circle => (
          <Circle
            key={circle.id}
            id={circle.id}
            size={circle.size}
            position={circle.position}
            isSelected={selectedCircleIds.has(circle.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slide;
