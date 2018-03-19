const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);
const rgbaObjectToString = obj => `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})`;

const createExportConfig = state => ({
  meta: state.meta,
  date: {
    start: state.date.start,
    end: state.date.end,
    interval: state.date.interval
  },
  style: state.style,
  map: state.map
});

const getShareUrl = id => `${window.location.host}/view/${id}`;

module.exports = { capitalizeFirstLetter, rgbaObjectToString, createExportConfig, getShareUrl };
