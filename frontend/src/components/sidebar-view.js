const React = require("react");
const moment = require("moment");
const { connect } = require("react-redux");

const formatDate = date => moment(date).format("YYYY-MM-DD");

const SidebarView = ({ meta, date }) => {
  return (
    <div className="inside-content sidebar-data">
      <div className="section__header">
        <h4>Name</h4>
      </div>
      <label className="inline-label">{meta.name}</label>
      <div className="section__header">
        <h4>Description</h4>
      </div>
      <label className="inline-label">{meta.description}</label>
      <div className="section__header">
        <h5>Date Span</h5>
      </div>
      <label className="inline-label">
        {formatDate(date.start)} - {formatDate(date.end)}
      </label>
    </div>
  );
};

const SidebarViewConnected = connect(({ date, style, meta }) => ({ date, style, meta }))(SidebarView);

module.exports = SidebarViewConnected;
