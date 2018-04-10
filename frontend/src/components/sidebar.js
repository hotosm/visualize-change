const React = require("react");
const { connect } = require("react-redux");
const { Icon } = require("@blueprintjs/core");

const { SlideTransition } = require("./transitions");
const { toggleSidebar } = require("../actions");

const Sidebar = ({ isOpen, isFullScreen, toggleSidebar, children }) => (
  <SlideTransition
    className="sidebar"
    visible={isOpen && !isFullScreen}
    direction={!isFullScreen ? "right-visible" : "right"}
  >
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
    <div className="sidebar-toggle" onClick={toggleSidebar}>
      <Icon icon={isOpen ? "chevron-left" : "chevron-right"} />
    </div>
  </SlideTransition>
);

const SidebarConnected = connect(({ ui }) => ({ isFullScreen: ui.fullScreenMode, isOpen: ui.sidebarOpen }), {
  toggleSidebar
})(Sidebar);

module.exports = SidebarConnected;
