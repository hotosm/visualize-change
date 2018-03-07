const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);
const rgbaObjectToString = obj => `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})`;

module.exports = { capitalizeFirstLetter, rgbaObjectToString };
