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

      // Calcula la posición del modal, asegurándose de que no se corte
      let top = Math.min(
        e.clientY - modalHeight / 2,
        screenHeight - modalHeight - 10
      );
      top = Math.max(top, 10);

      let left = Math.min(
        e.clientX + 20,
        screenWidth - modalWidth - 10
      );
      left = Math.max(left, 10);

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
      disableScrollLock={true} // Permite el scroll de la página
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
