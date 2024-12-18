/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const ModalComponent = ({ children, setOpen, open, onClose = () => {} }) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleOpenNearCursor = (e) => {
      if (open) {
        const modalWidth = 700; // Ancho estimado del modal
        const modalHeight = 500; // Altura estimada
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let top = Math.min(e.clientY, screenHeight - modalHeight - 10);
        let left = Math.min(e.clientX, screenWidth - modalWidth - 10);

        top = Math.max(10, top); // Asegurarse de que no se salga por arriba
        left = Math.max(10, left); // Asegurarse de que no se salga por la izquierda

        setPosition({ top, left });
      }
    };

    // Escuchamos el clic inicial para determinar la posición
    if (open) {
      window.addEventListener('click', handleOpenNearCursor, { once: true });
    }

    return () => {
      window.removeEventListener('click', handleOpenNearCursor);
    };
  }, [open]);

  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    setPosition({
      top: e.clientY - dragOffset.y,
      left: e.clientX - dragOffset.x,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
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
    cursor: dragging ? 'grabbing' : 'grab',
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableScrollLock={true}
      sx={{
        '& .MuiBackdrop-root': {
          background: 'transparent',
        },
      }}
    >
      <Box
        sx={style}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </Box>
    </Modal>
  );
};

export default ModalComponent;
