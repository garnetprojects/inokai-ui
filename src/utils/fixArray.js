export const fixCentersArray = (data) => {
  return data.map((item) => ({ value: item._id, text: item.centerName }));
};

export const fixUserArray = (data) => {
  return data.map((item) => ({ value: item._id, text: item.name }));
};
