const React = require("react");
const { connect } = require("react-redux");
const { Button, ButtonGroup, Switch, Label } = require("@blueprintjs/core");
const { DateRangePicker } = require("@blueprintjs/datetime");
const { SketchPicker } = require("react-color");
const debounce = require("lodash.debounce");

const { setInterval, setDateSpan, setMapBackground, setFeatureStyle, setMetadata } = require("../actions");
const { capitalizeFirstLetter, rgbaObjectToString } = require("../utils");

const SidebarPanelHeader = ({ title }) => (
  <div className="sidebar-header">
    <h5>{title}</h5>
  </div>
);

const DescribePanel = ({ metadata, setMetadata }) => (
  <div className="sidebar-panel">
    <SidebarPanelHeader title="Describe" />
    <div className="inside-content">
      <Label text="Name" required={true}>
        <input className="pt-input" value={metadata.name} onChange={ev => setMetadata("name", ev.target.value)} />
      </Label>
      <Label text="Description" required={true}>
        <textarea
          className="pt-input"
          value={metadata.description}
          onChange={ev => setMetadata("description", ev.target.value)}
        />
      </Label>
      <Label text="Project" required={true}>
        <input className="pt-input" value={metadata.project} onChange={ev => setMetadata("project", ev.target.value)} />
      </Label>
    </div>
  </div>
);

const DatePanel = ({ date, onChangeDate, onChangeInterval }) => (
  <div className="sidebar-panel">
    <SidebarPanelHeader title="Dates" />
    <div className="inside-content">
      <DateRangePicker
        shortcuts={false}
        contiguousCalendarMonths={false}
        value={[new Date(date.start || date.end), date.end ? new Date(date.end) : null]}
        onChange={onChangeDate}
      />
    </div>
    <div className="inside-content">
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
    </div>
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
        {capitalizeFirstLetter(name.replace("-", " "))}
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
    <div className="inside-content section">
      <div className="section__header">
        <h4>{capitalizeFirstLetter(style.name)}</h4>
        <StyleEnabledButton
          enabled={style.enabled}
          onClick={newValue => onStyleChange(Object.assign({}, style, { enabled: newValue }))}
        />
      </div>
      <div className="subsection">
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
      </div>
      <div className="subsection">
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
      </div>
    </div>
  );
};

const StylesPanel = ({ styles, onStyleChange, onBackgroundStyleChange }) => {
  return (
    <div className="sidebar-panel">
      <SidebarPanelHeader title="Styles" />
      <div className="inside-content section">
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
      </div>
      {styles.features.map((style, idx) => (
        <StyleSection key={style.name} style={style} onStyleChange={newStyle => onStyleChange(idx, newStyle)} />
      ))}
    </div>
  );
};

const SidebarEdit = ({
  meta,
  date,
  style,
  setDateSpan,
  setInterval,
  setMapBackground,
  setFeatureStyle,
  setMetadata
}) => {
  return (
    <div className="sidebar-content__inside">
      <DescribePanel metadata={meta} setMetadata={setMetadata} />
      <DatePanel date={date} onChangeDate={setDateSpan} onChangeInterval={setInterval} />
      <StylesPanel styles={style} onStyleChange={setFeatureStyle} onBackgroundStyleChange={setMapBackground} />
    </div>
  );
};

const SidebarEditConnected = connect(({ meta, date, style }) => ({ meta, date, style }), {
  setInterval,
  setDateSpan,
  setFeatureStyle,
  setMapBackground,
  setMetadata
})(SidebarEdit);

module.exports = SidebarEditConnected;

{
  /*
    <Tabs animate={true} id="SidebarTabs" className="sidebar-tabs" renderActiveTabPanelOnly={true}>
      <Tab id="Describe" title="Describe" panel={<DescribePanel metadata={meta} setMetadata={setMetadata} />} />
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
    */
}
