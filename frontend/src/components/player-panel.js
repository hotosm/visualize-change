const React = require("react");
const moment = require("moment");
const { connect } = require("react-redux");
const { Button, ButtonGroup, Slider } = require("@blueprintjs/core");

const { FadeTransition } = require("./transitions");
const { togglePlay, setSelectedDate, toggleFullscreen, hidePlayerPanel } = require("../actions");
const { capitalizeFirstLetter } = require("../utils");

class PlayerPanel extends React.Component {
  onSliderUpdate = value => {
    const { start, interval } = this.props.date;
    const newSelectedDate = moment(start)
      .add(value, interval)
      .valueOf();
    this.props.setSelectedDate(newSelectedDate);
  };

  calcValueFromDates = selected => {
    const { start, interval } = this.props.date;
    return moment.duration(moment(selected).diff(moment(start)))[`as${capitalizeFirstLetter(interval)}`]();
  };

  componentWillReceiveProps(nextProps) {
    // Naive implementation
    if (nextProps.date.isPlaying) {
      this.playTimer = setTimeout(() => {
        const next = moment(this.props.date.selected)
          .add(1, this.props.date.interval)
          .valueOf();
        this.props.setSelectedDate(next);
      }, 1000);
    } else {
      clearTimeout(this.playTimer);
    }
  }

  render() {
    const { date, togglePlay, toggleFullscreen, isFullScreenMode } = this.props;
    return (
      <div className="map-footer__content" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
        <div className="map-footer__items">
          <Button className="pt-minimal" icon={date.isPlaying ? "pause" : "play"} onClick={togglePlay} />
          <div className="map-footer__progressbar">
            <Slider
              isFullScreenMode={isFullScreenMode}
              disabled={date.isPlaying}
              min={0}
              max={this.calcValueFromDates(this.props.date.end)}
              stepSize={1}
              labelRenderer={false}
              onChange={this.onSliderUpdate}
              value={this.calcValueFromDates(this.props.date.selected)}
            />
          </div>
          <ButtonGroup minimal={true}>
            <Button icon="fullscreen" onClick={toggleFullscreen} />
          </ButtonGroup>
        </div>
        <div className="map-footer__date">{moment(date.selected).format("YYYY-MM-DD")}</div>
      </div>
    );
  }
}

// <Button icon="share" onClick={showExportMenu} />

const PlayerPanelConnected = connect(
  ({ date, ui }) => ({
    date,
    isSidebarOpen: ui.sidebarOpen,
    isFullScreenMode: ui.fullScreenMode
  }),
  {
    togglePlay,
    toggleFullscreen,
    setSelectedDate
  }
)(PlayerPanel);

class PlayerPanelWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = { locked: false };
  }

  onMouseOver = () => {
    clearInterval(this.uiTimer);
    this.setState({ locked: true });
  };

  onMouseOut = () => {
    this.setState({ locked: false });
    clearInterval(this.uiTimer);
    if (!!this.props.isFullScreenMode) {
      this.uiTimer = setInterval(() => {
        this.props.hidePlayerPanel();
      }, 3000);
    }
  };

  componentWillReceiveProps(nextProps) {
    if (!!nextProps.visible || !!this.props.visible) {
      clearInterval(this.uiTimer);
      this.uiTimer = setInterval(() => {
        this.props.hidePlayerPanel();
      }, 3000);
    } else {
      clearInterval(this.uiTimer);
    }
  }

  render() {
    const { visible, isFullScreenMode } = this.props;
    return (
      <FadeTransition
        visible={visible}
        className="map-footer"
        style={{ left: !isFullScreenMode ? (isSidebarOpen ? 350 : 15) : 0 }}
      >
        <div className="map-footer__content" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
          <PlayerPanelConnected />
        </div>
      </FadeTransition>
    );
  }
}

const PlayerPanelWrapperConnected = connect(
  ({ ui }) => ({
    isSidebarOpen: ui.sidebarOpen,
    isFullScreenMode: ui.fullScreenMode,
    visible: ui.playerPanelVisible
  }),
  {
    toggleFullscreen,
    hidePlayerPanel
  }
)(PlayerPanelWrapper);

module.exports = PlayerPanelWrapperConnected;
