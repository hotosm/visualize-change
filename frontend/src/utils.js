const moment = require("moment");
const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);
const rgbaObjectToString = obj => `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})`;

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

const getShareUrl = id => `${window.location.host}/view/${id}`;

const isDateSpanAllowed = (v, { start, end }) => {
  // const diffDays = (end - start) / (24 * 60 * 60 * 1000);
  // const moment.duration(moment(selected).diff(moment(start)))[`as${capitalizeFirstLetter(interval)}`]();
  const numUnits = moment(end).diff(moment(start), v) || 0;
  console.log("numUnits", numUnits, v);

  // return {
  //   hours: diffDays < 30,
  //   days: diffDays > 2 && diffDays < 90,
  //   weeks: diffDays > 14
  // }[v];
  //

  return numUnits <= 30 && numUnits > 1;
};

module.exports = { capitalizeFirstLetter, rgbaObjectToString, createExportConfig, getShareUrl, isDateSpanAllowed };
