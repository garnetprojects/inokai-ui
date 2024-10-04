/* eslint-disable react/prop-types */
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '70%', md: '100%' },
  maxWidth: '700px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  px: 4,
  pb: 5,
  maxHeight: '100%',
  overflow: 'auto',
};

export default function ModalComponent({
  children,
  setOpen,
  open,
  onClose = () => {},
}) {
  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ px: 10 }}
    >
      <Box sx={style}>{children}</Box>
    </Modal>
  );
}
