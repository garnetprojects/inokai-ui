/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const ModalComponent = ({ children, setOpen, open, onClose = () => {} }) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  useEffect(() => {
    const handlePosition = (e) => {
      const modalWidth = 700; // Ancho del modal
      const modalHeight = 500; // Altura estimada
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Coordenadas iniciales respecto al clic
      let left = e.clientX + 20; // 20px a la derecha del clic
      let top = e.clientY - modalHeight / 2; // Centrado verticalmente

      // Ajuste si se pasa del borde derecho
      if (left + modalWidth > screenWidth) {
        left = screenWidth - modalWidth - 10; // Mover hacia la izquierda
      }

      // Ajuste si se pasa del borde izquierdo
      if (left < 10) {
        left = 10; // Dejar 10px desde el borde izquierdo
      }

      // Ajuste si se pasa del borde inferior
      if (top + modalHeight > screenHeight) {
        top = screenHeight - modalHeight - 10; // Mover hacia arriba
      }

      // Ajuste si se pasa del borde superior
      if (top < 10) {
        top = 10; // Dejar 10px desde el borde superior
      }

      setPosition({ top, left });
    };

    if (open) {
      window.addEventListener('click', handlePosition, { once: true });
    }

    return () => {
      window.removeEventListener('click', handlePosition);
    };
  }, [open]);

  const style = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    transform: 'translate(0, 0)', // Usamos coordenadas dinámicas
    width: { xs: '90%', md: '700px' },
    bgcolor: 'background.paper',
    boxShadow: 24,
    px: 4,
    pb: 5,
    maxHeight: '90vh',
    overflow: 'auto',
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        '& .MuiBackdrop-root': {
          background: 'transparent', // Fondo transparente
        },
      }}
    >
      <Box sx={style}>{children}</Box>
    </Modal>
  );
};

export default ModalComponent;
