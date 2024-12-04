/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const ModalComponent = ({
  children,
  setOpen,
  open,
  onClose = () => {},
  centerOnOpen, // Nueva prop para centrar el modal si es necesario
}) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  useEffect(() => {
    const handlePosition = (e) => {
      if (centerOnOpen) {
        // Si se solicita abrir centrado, usamos el comportamiento estándar
        setPosition({ top: '50%', left: '50%' });
        return;
      }

      const modalWidth = 700; // Ajusta esto según el ancho máximo de tu modal
      const modalHeight = 500; // Altura estimada
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let left = e.clientX + 20; // 20px a la derecha del clic
      let top = e.clientY - modalHeight / 2; // Centrado verticalmente respecto al clic

      // Ajuste si se pasa del borde derecho
      if (left + modalWidth > screenWidth) {
        left = e.clientX - modalWidth - 20; // Mover hacia la izquierda
      }

      // Ajuste si se pasa del borde superior o inferior
      if (top < 0) top = 10; // Dejar 10px desde el borde superior
      if (top + modalHeight > screenHeight) top = screenHeight - modalHeight - 10;

      setPosition({ top, left });
    };

    // Escucha el evento de clic solo si el modal se abre
    if (open) {
      if (!centerOnOpen) {
        window.addEventListener('click', handlePosition, { once: true });
      } else {
        setPosition({ top: '50%', left: '50%' }); // Forzamos el centro si se solicita
      }
    }

    return () => {
      window.removeEventListener('click', handlePosition);
    };
  }, [open, centerOnOpen]);

  const style = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    transform: centerOnOpen ? 'translate(-50%, -50%)' : 'translate(0, 0)',
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
