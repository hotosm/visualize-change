const React = require("react");
const { connect } = require("react-redux");
const { Button, Popover } = require("@blueprintjs/core");
const onClickOutside = require("react-onclickoutside").default;

const { HELP_SLIDE_ORDER } = require("../constans/index");

const { showPopover, hidePopover, setTutorialModeOff, goToNextInTutorial, changeSidebarTab } = require("../actions");

class HelpPopover extends React.Component {
  handleClickOutside(ev) {
    const className = ev.target.className;
    const parentClassName = ev.target.parentNode.className;

    if (
      className === "pt-button-text" ||
      className === "pt-button action-button" ||
      className === "help-popover" ||
      className === "help-content" ||
      parentClassName === "pt-button close-button" ||
      parentClassName === "help-popover"
    ) {
      return;
    }

    this.props.setTutorialModeOff();
  }

  render() {
    const {
      helpText,
      id,
      tutorialMode,
      visiblePopovers,
      showPopover,
      hidePopover,
      setTutorialModeOff,
      goToNextInTutorial
    } = this.props;

    const slideIndex = HELP_SLIDE_ORDER.findIndex(slideId => id === slideId);
    const isLast = slideIndex >= HELP_SLIDE_ORDER.length - 1;
    return (
      <Popover
        isOpen={visiblePopovers.includes(id)}
        onClose={() => hidePopover(id)}
        preventOverflow={{ enabled: true, boundariesElement: "scrollParent" }}
        content={
          <div className="help-popover" onClick={ev => ev.stopPropagation()}>
            <Button className="close-button" icon="cross" onClick={() => setTutorialModeOff() && hidePopover(id)} />
            <div className="help-content">
              Help Text For {helpText}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque mauris ipsum,
              lobortis vel aliquet quis, elementum nec purus. Maecenas egestas risus varius, maximus sem quis, efficitur
              purus. Donec vitae mauris vitae sapien sagittis accumsan et non diam. Fusce maximus, nunc sit amet tempus
              posuere, odio odio malesuada ligula, nec pretium sapien lectus eget lectus. Ut vitae orci a quam pulvinar
              consequat. Sed aliquam sapien vitae quam blandit, ut hendrerit nulla posuere. Nunc porttitor nulla id
              tincidunt placerat.
            </div>
            {tutorialMode && (
              <Button
                className="action-button"
                onClick={ev => {
                  ev.stopPropagation();
                  isLast
                    ? hidePopover(id) && setTutorialModeOff() && changeSidebarTab("simpleEdit")
                    : goToNextInTutorial(id);
                }}
              >
                {isLast ? "Close" : "Next"}
              </Button>
            )}
          </div>
        }
        target={
          <Button
            className="help-button"
            icon="help"
            onClick={ev => {
              ev.stopPropagation();
              showPopover(id);
            }}
          />
        }
      />
    );
  }
}

const HelpPopoverConnected = connect(
  ({ ui }) => ({ tutorialMode: ui.tutorialMode, visiblePopovers: ui.visiblePopoversIds }),
  {
    showPopover,
    hidePopover,
    setTutorialModeOff,
    goToNextInTutorial
  }
)(onClickOutside(HelpPopover));

module.exports = HelpPopoverConnected;
