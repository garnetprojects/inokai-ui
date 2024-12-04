import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';

const DraggablePaperComponent = (props) => {
  return (
    <Draggable
      handle="#draggable-modal-title" // Área movible
      cancel={'[class*="MuiDialogContent-root"]'} // Evitar arrastrar desde el contenido
    >
      <Paper {...props} />
    </Draggable>
  );
};

const ModalComponent = ({ children, setOpen, open, onClose = () => {}, cursorPosition }) => {
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  // Establecer la posición inicial del modal según el cursor
  useEffect(() => {
    if (cursorPosition && open) {
      const { clientX, clientY } = cursorPosition;
      setPosition({
        top: clientY + 10, // Posición vertical ajustada
        left: clientX + 10, // Posición horizontal ajustada
      });
    }
  }, [cursorPosition, open]);

  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  const style = {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: 'translate(0, 0)', // No centrado por defecto
    width: { xs: '90%', md: '500px' },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableEnforceFocus // Mejora la experiencia al arrastrar
    >
      <Box component={DraggablePaperComponent} sx={style}>
        <Box id="draggable-modal-title" sx={{ cursor: 'move', mb: 2 }}>
          {/* Área Movible */}
          <Box
            component="div"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 1,
              borderRadius: '4px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            Mueve este modal
          </Box>
        </Box>
        {children}
      </Box>
    </Modal>
  );
};

export default ModalComponent;
