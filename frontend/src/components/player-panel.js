const React = require("react");
const moment = require("moment");
const { connect } = require("react-redux");
const { Button, ButtonGroup, Slider } = require("@blueprintjs/core");

const { DEFAULT_DATE_FORMAT } = require("../constans/index");
const { FadeTransition } = require("./transitions");
const HelpPopoverConnected = require("./help");
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
    if (!selected) {
      return 0;
    }

    const { start, interval } = this.props.date;
    if (!interval) return 0;
    return moment.duration(moment(selected).diff(moment(start)))[`as${capitalizeFirstLetter(interval)}`]();
  };

  componentWillReceiveProps(nextProps) {
    // TODO: Fix this, naive implementation
    // and also the names are kind of unfortune ;)
    if (nextProps.date.isPlaying) {
      this.playTimer = setTimeout(() => {
        const next = moment(this.props.date.selected)
          .add(1, this.props.date.interval)
          .valueOf();
        this.props.setSelectedDate(next);
      }, 1000 / this.props.date.speed);
    } else {
      clearTimeout(this.playTimer);
    }
  }

  render() {
    const { date, togglePlay, toggleFullscreen, isFullScreenMode, isMapLoaded } = this.props;

    const max = this.props.date.end ? this.calcValueFromDates(this.props.date.end) : 1;
    const value = this.calcValueFromDates(this.props.date.selected);

    return (
      <div className="map-footer__content" onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
        <div className="map-footer__items">
          <Button
            className="pt-minimal play-btn"
            icon={date.isPlaying ? "pause" : "play"}
            size={20}
            disabled={!isMapLoaded}
            onClick={togglePlay}
          />
          <div className="map-footer__progressbar">
            <Slider
              isFullScreenMode={isFullScreenMode}
              disabled={date.isPlaying}
              min={0}
              max={max}
              stepSize={1}
              labelRenderer={false}
              onChange={this.onSliderUpdate}
              value={value}
            />
          </div>
          <ButtonGroup minimal={true}>
            <Button icon="fullscreen" onClick={toggleFullscreen} />
          </ButtonGroup>
        </div>
        <div className="map-footer__date">
          {moment(date.selected).format(DEFAULT_DATE_FORMAT)}
          <div className="o">
            <HelpPopoverConnected id="bottombar-help" text="Bottombar Help" />
          </div>
        </div>
      </div>
    );
  }
}

const PlayerPanelConnected = connect(
  ({ date, ui }) => ({
    date,
    isSidebarOpen: ui.sidebarOpen,
    isFullScreenMode: ui.fullScreenMode,
    isMapLoaded: ui.mapLoaded
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
    const { visible, isSidebarOpen, isFullScreenMode } = this.props;
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
