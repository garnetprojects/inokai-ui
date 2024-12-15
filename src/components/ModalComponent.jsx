/* eslint-disable react/prop-types */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const ModalComponent = ({ children, setOpen, open, onClose = () => {} }) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  const handleMouseDown = (e) => {
    // Activamos el modo "dragging" y calculamos el offset inicial
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    // Actualizamos la posición del modal basándonos en el movimiento
    setPosition({
      top: e.clientY - dragOffset.y,
      left: e.clientX - dragOffset.x,
    });
  };

  const handleMouseUp = () => {
    setDragging(false); // Desactivamos el modo "dragging"
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
    cursor: dragging ? 'grabbing' : 'grab', // Cambiamos el cursor al arrastrar
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Detenemos el "dragging" si el mouse sale del modal
      >
        {children}
      </Box>
    </Modal>
  );
};

export default ModalComponent;
