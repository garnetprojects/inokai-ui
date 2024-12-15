/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const ModalComponent = ({ children, setOpen, open, onClose = () => {} }) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  const handleDragStart = (e) => {
    // Calculamos el offset inicial al hacer clic
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDrag = (e) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Ignorar eventos de "ghost drag"

    // Actualizamos la posición según el movimiento
    setPosition({
      top: e.clientY - dragOffset.y,
      left: e.clientX - dragOffset.x,
    });
  };

  const handleDragEnd = (e) => {
    // Evitamos que el modal quede fuera de la pantalla
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const modalWidth = 700; // Ancho del modal
    const modalHeight = 500; // Altura del modal

    let top = Math.min(
      Math.max(0, position.top),
      screenHeight - modalHeight
    );
    let left = Math.min(
      Math.max(0, position.left),
      screenWidth - modalWidth
    );

    setPosition({ top, left });
  };

  const style = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    transform: 'translate(0, 0)', // Coordenadas dinámicas
    width: { xs: '90%', md: '700px' },
    bgcolor: 'background.paper',
    boxShadow: 24,
    px: 4,
    pb: 5,
    maxHeight: '90vh',
    overflow: 'auto',
    cursor: 'move', // Cambiamos el cursor al arrastrar
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableScrollLock={true} // Permite el scroll de la página
      sx={{
        '& .MuiBackdrop-root': {
          background: 'transparent', // Fondo transparente
        },
      }}
    >
      <Box
        sx={style}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {children}
      </Box>
    </Modal>
  );
};

export default ModalComponent;
