const React = require("react");
const { connect } = require("react-redux");
const { Button, ButtonGroup, Switch, Icon, Label, Tab, Tabs, Card } = require("@blueprintjs/core");
const { DateRangePicker } = require("@blueprintjs/datetime");
const { SketchPicker } = require("react-color");
const classNames = require("classnames");
const debounce = require("lodash.debounce");

const { setInterval, setDateSpan, setMapBackground, setFeatureStyle } = require("../actions");
const { capitalizeFirstLetter, rgbaObjectToString } = require("../utils");

const DescribePanel = () => (
  <Card className="siderbar__card">
    <div>
      <Label text="Name" required={true}>
        <input className="pt-input" />
      </Label>
      <Label text="Description" required={true}>
        <textarea className="pt-input" />
      </Label>
      <Label text="Project" required={true}>
        <input className="pt-input" />
      </Label>
    </div>
  </Card>
);

const DatePanel = ({ date, onChangeDate, onChangeInterval }) => (
  <div>
    <DateRangePicker
      shortcuts={false}
      contiguousCalendarMonths={false}
      maxDate={new Date()}
      value={[new Date(date.start), date.end ? new Date(date.end) : null]}
      onChange={onChangeDate}
    />
    <Card>
      <label className="inline-label">
        Interval:
        <ButtonGroup>
          {["hours", "days", "weeks"].map(v => (
            <Button key={v} active={date.interval === v} onClick={() => onChangeInterval(v)}>
              {capitalizeFirstLetter(v)}
            </Button>
          ))}
        </ButtonGroup>
      </label>
    </Card>
  </div>
);

const StyleSwitch = ({ name, value, onChange }) => (
  <div>
    <label className="inline-label">
      {capitalizeFirstLetter(name)}
      <Switch checked={value} onChange={() => onChange(!value)} />
    </label>
  </div>
);

class StyleColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { displayColorPicker: false };
    this.onColorChange = debounce(this.onColorChange, 200);
  }

  onColorChange = color => {
    this.props.onChange(color.rgb);
  };

  onCloseClick = () => {
    this.setState({ displayColorPicker: false });
  };

  onOpenClick = () => {
    this.setState({ displayColorPicker: true });
  };

  render() {
    return (
      <div>
        <label className="inline-label">
          {capitalizeFirstLetter(this.props.name.replace("-", " "))}
          <div className="color-picker">
            <div className="color-picker__swatch" onClick={this.onOpenClick}>
              <div className="color-picker__color" style={{ background: rgbaObjectToString(this.props.value) }} />
            </div>
            {this.state.displayColorPicker ? (
              <div className="popover">
                <div className="cover" onClick={this.onCloseClick} />
                <SketchPicker color={this.props.value} onChange={this.onColorChange} />
              </div>
            ) : null}
          </div>
        </label>
      </div>
    );
  }
}

const StyleNumberPicker = ({ name, value, onChange }) => {
  return (
    <div>
      <label className="inline-label">
        {capitalizeFirstLetter(name)}
        <input type="number" min={0} max={10} step={0.1} value={value} onChange={ev => onChange(ev.target.value)} />
      </label>
    </div>
  );
};

const STYLE_TO_COMPONENT = {
  enabled: StyleSwitch,
  "line-color": StyleColorPicker,
  "line-width": StyleNumberPicker
};

const StyleEnabledButton = ({ enabled, onClick }) => (
  <Button className="pt-minimal" icon={`eye-${enabled ? "open" : "off"}`} onClick={() => onClick(!enabled)} />
);

const StylePart = ({ style, onChange }) => {
  return React.createElement(
    "div",
    null,
    Object.keys(style).map(styleKey => {
      const component = STYLE_TO_COMPONENT[styleKey];
      return React.createElement(component, {
        key: styleKey,
        name: styleKey,
        value: style[styleKey],
        onChange: newValue => onChange(Object.assign({}, style, { [styleKey]: newValue }))
      });
    })
  );
};

const StyleSection = ({ style, onStyleChange }) => {
  return (
    <Card>
      <div className="section__header">
        <h4>{capitalizeFirstLetter(style.name)}</h4>
        <StyleEnabledButton
          enabled={style.enabled}
          onClick={newValue => onStyleChange(Object.assign({}, style, { enabled: newValue }))}
        />
      </div>
      <Card>
        <label className="inline-label">
          <h5>Base</h5>
          <StyleEnabledButton
            enabled={style.baseEnabled}
            onClick={newValue => onStyleChange(Object.assign({}, style, { baseEnabled: newValue }))}
          />
        </label>
        <StylePart
          style={style.base}
          onChange={newValue => onStyleChange(Object.assign({}, style, { base: newValue }))}
        />
      </Card>
      <Card>
        <label className="inline-label">
          <h5>Highlighted</h5>
          <StyleEnabledButton
            enabled={style.highlightEnabled}
            onClick={newValue => onStyleChange(Object.assign({}, style, { highlightEnabled: newValue }))}
          />
        </label>
        <StylePart
          style={style.highlight}
          onChange={newValue => onStyleChange(Object.assign({}, style, { highlight: newValue }))}
        />
      </Card>
    </Card>
  );
};

const StylesPanel = ({ styles, onStyleChange, onBackgroundStyleChange }) => {
  return (
    <div className="styles-panel">
      <Card>
        <div className="section__header">
          <h4>Map</h4>
        </div>
        <div>
          <label className="inline-label">
            Background Theme
            <div className="pt-select">
              <select value={styles.background} onChange={ev => onBackgroundStyleChange(ev.target.value)}>
                {["light", "dark", "basic", "streets", "bright", "satellite"].map(style => (
                  <option key={style} value={style}>
                    {capitalizeFirstLetter(style)}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </Card>
      {styles.features.map((style, idx) => (
        <StyleSection key={style.name} style={style} onStyleChange={newStyle => onStyleChange(idx, newStyle)} />
      ))}
    </div>
  );
};

const Sidebar = ({ date, style, isOpen, setDateSpan, setInterval, setMapBackground, setFeatureStyle }) => {
  return (
    <div className={classNames("sidebar", { "sidebar--hiden": !isOpen })}>
      <div className="sidebar-content">
        <Tabs animate={true} id="SidebarTabs" renderActiveTabPanelOnly={true}>
          <Tab id="Describe" title="Describe" panel={<DescribePanel />} />
          <Tab
            id="Date"
            title="Date"
            panel={<DatePanel date={date} onChangeDate={setDateSpan} onChangeInterval={setInterval} />}
          />
          <Tab
            id="Style"
            title="Style"
            panel={
              <StylesPanel styles={style} onStyleChange={setFeatureStyle} onBackgroundStyleChange={setMapBackground} />
            }
          />
        </Tabs>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer__content">
          <span>Made with </span>
          <Icon icon="heart" iconSize={12} style={{ marginTop: 3 }} />
          <span> by HOT and friends</span>
        </div>
      </div>
    </div>
  );
};

const SidebarConnected = connect(({ date, style, ui }) => ({ date, style, isOpen: ui.sidebarOpen }), {
  setInterval,
  setDateSpan,
  setFeatureStyle,
  setMapBackground
})(Sidebar);

module.exports = SidebarConnected;
