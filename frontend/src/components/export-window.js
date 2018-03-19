const React = require("react");
const { connect } = require("react-redux");
const { Button, Tabs, Tab, Card, Elevation, Overlay } = require("@blueprintjs/core");
const clipboardCopy = require("clipboard-copy");

const { hideExportMenu, sendToRenderer } = require("../actions");

const { getShareUrl } = require("../utils");

const URLShare = ({ url }) => (
  <Card>
    <div className="pt-input-group .modifier">
      <input type="text" className="pt-input" value={url} onChange={() => {}} />
      <button className="pt-button pt-minimal pt-intent-warning pt-icon-clipboard" onClick={() => clipboardCopy(url)} />
    </div>
  </Card>
);

class GenericMediaShare extends React.Component {
  constructor() {
    super();
    this.state = { email: "", fps: 10 };
  }

  onEmailChange = ev => {
    this.setState({ email: ev.target.value });
  };

  onFPSChange = ev => {
    this.setState({ fps: ev.target.value });
  };

  onExportClick = () => {
    this.props.onExportClick({ email: this.state.email, fps: this.state.fps });
  };

  render() {
    return (
      <Card>
        <div className="form-body">
          <label className="inline-label">
            E-mail:
            <input value={this.state.email} onChange={this.onEmailChange} className="pt-input" />
          </label>
          <label className="inline-label">
            FPS
            <input value={this.state.fps} onChange={this.onFPSChange} className="pt-input" />
          </label>
          <Button icon="share" onClick={this.onExportClick}>
            Share
          </Button>
        </div>
      </Card>
    );
  }
}

class ExportMenu extends React.Component {
  onExportClick = (format, { email, fps }) => {
    this.props.sendToRenderer({ format, email, fps });
  };

  render() {
    const { isOpen, hideExportMenu, location } = this.props;
    const id = location.pathname.split("/").slice(-1);
    return (
      <Overlay isOpen={isOpen} canOutsideClickClose={true} onClose={hideExportMenu}>
        <Card elevation={Elevation.FOUR} className="export-menu">
          <Tabs animate={true} id="ExportTabs" className="export-tabs" renderActiveTabPanelOnly={false}>
            <Tab id="Url" title="URL" panel={<URLShare url={getShareUrl(id)} />} />
            <Tab
              id="MP4"
              title="MP4"
              panel={<GenericMediaShare onExportClick={data => this.onExportClick("video", data)} />}
            />
            <Tab
              id="GIF"
              title="GIF"
              panel={<GenericMediaShare onExportClick={data => this.onExportClick("gif", data)} />}
            />
          </Tabs>
        </Card>
      </Overlay>
    );
    // return (
    //   <Overlay isOpen={isOpen} canOutsideClickClose={true} onClose={hideExportMenu}>
    //     <Card elevation={Elevation.FOUR} className="export-menu">
    //       <h4>Export</h4>
    //       <div className="form-body">
    //         <label className="inline-label">
    //           E-mail:
    //           <input value={this.state.email} onChange={this.onEmailChange} className="pt-input" />
    //         </label>
    //         <label className="inline-label">
    //           Format
    //           <div className="pt-select">
    //             <select onChange={this.onFormatChange}>
    //               <option value="video">Video</option>
    //               <option value="gif">GIF</option>
    //             </select>
    //           </div>
    //         </label>
    //         <label className="inline-label">
    //           FPS
    //           <input value={this.state.fps} onChange={this.onFPSChange} className="pt-input" />
    //         </label>
    //         <Button icon="share" onClick={this.onExportClick}>
    //           Export
    //         </Button>
    //       </div>
    //     </Card>
    //   </Overlay>
    // );
  }
}

const ExportMenuConnected = connect(({ ui, router }) => ({ isOpen: ui.exportMenuOpen, location: router.location }), {
  hideExportMenu,
  sendToRenderer
})(ExportMenu);

module.exports = ExportMenuConnected;
