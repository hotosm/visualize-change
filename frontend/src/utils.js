const moment = require("moment");
const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);
const rgbaObjectToString = obj => `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})`;
const { MAX_ANIMATION_UNITS } = require("./constans/index");

const createExportConfig = state => ({
  meta: state.meta,
  date: {
    start: state.date.start,
    end: state.date.end,
    interval: state.date.interval,
    speed: state.date.speed
  },
  style: state.style,
  map: state.map
});

const getShareUrl = id => `https://${window.location.host}/view/${id}`;

const isDateSpanAllowed = (v, { start, end }) => {
  const numUnits = moment(end).diff(moment(start), v) || 0;

  return numUnits <= MAX_ANIMATION_UNITS && numUnits > 1;
};

module.exports = { capitalizeFirstLetter, rgbaObjectToString, createExportConfig, getShareUrl, isDateSpanAllowed };
