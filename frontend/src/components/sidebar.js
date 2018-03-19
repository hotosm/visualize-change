const React = require("react");
const { connect } = require("react-redux");
const classNames = require("classnames");
const { Icon } = require("@blueprintjs/core");

const { toggleSidebar } = require("../actions");

const Sidebar = ({ isOpen, toggleSidebar, children }) => (
  <div className={classNames("sidebar", { "sidebar--hiden": !isOpen })}>
    <div className="sidebar-content">
      {children}
      <div className="sidebar-footer">
        <div className="sidebar-footer__content">
          <span>Made with </span>
          <Icon icon="heart" iconSize={12} style={{ marginTop: 3 }} />
          <span> by HOT and friends</span>
        </div>
      </div>
    </div>
    <div className="sidebar-toggle" onClick={toggleSidebar} />
  </div>
);

const SidebarConnected = connect(({ ui }) => ({ isOpen: ui.sidebarOpen }), {
  toggleSidebar
})(Sidebar);

module.exports = SidebarConnected;
