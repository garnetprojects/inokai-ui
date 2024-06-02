import { Box, Chip } from '@mui/material';
import MultipleSelectComponent from './MultipleSelectComponent';
import { services } from '../utils/options';

const ServicesBox = ({ disabled, setSelectedOption, selectedOption }) => {
  const handleDelete = (name) => {
    setSelectedOption((prev) => prev.filter((item) => item !== name));
  };

  return (
    <Box>
      <MultipleSelectComponent
        options={services}
        setSelectedOption={setSelectedOption}
        selectedOption={selectedOption}
        disabled={disabled}
      />

      <Box
        my={1}
        py={2}
        gap={1}
        paddingX={3}
        bgcolor={'#eee'}
        display={'flex'}
        flexWrap={'wrap'}
      >
        {selectedOption.map((name) => {
          const [type, minutes, color] = name.split('-');

          return (
            <Chip
              key={name}
              label={name}
              onDelete={() => handleDelete(name)}
              disabled={disabled}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default ServicesBox;
