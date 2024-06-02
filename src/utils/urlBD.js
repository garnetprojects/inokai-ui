export const urlBD = (companyName) => {
  const baseUrl = window.location.origin;
  console.log(baseUrl);
  return `${baseUrl}/${companyName.replace(/ /g, '-')}`;
};
