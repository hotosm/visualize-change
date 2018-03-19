const React = require("react");
const moment = require("moment");
const { connect } = require("react-redux");
const { Card } = require("@blueprintjs/core");

const formatDate = date => moment(date).format("YYYY-MM-DD");

const SidebarView = ({ meta, date }) => {
  return (
    <Card className="sidebar-data">
      <p>
        Name: <span className="value">{meta.name}</span>
      </p>
      <p>
        Description: <span className="value">{meta.description}</span>
      </p>
      <p>
        Project: <span className="value">{meta.project}</span>
      </p>
      <p>
        Date Span:{" "}
        <span className="value">
          {formatDate(date.start)} - {formatDate(date.end)}
        </span>
      </p>
    </Card>
  );
};

const SidebarViewConnected = connect(({ date, style, meta }) => ({ date, style, meta }))(SidebarView);

module.exports = SidebarViewConnected;
