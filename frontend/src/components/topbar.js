const React = require("react");
const classNames = require("classnames");
const { Button, ButtonGroup, Navbar, NavbarGroup, NavbarHeading, Spinner } = require("@blueprintjs/core");

const { SlideTransition } = require("./transitions");
const { connect } = require("react-redux");
const { Link } = require("react-router-dom");

const { setTutorialModeOn } = require("../actions");

const isLinkDisabled = path => path !== "view" && path !== "edit";

const Topbar = ({
  id = null,
  path,
  canSave,
  saving,
  isEditing,
  onSaveClick,
  isFullScreenMode,
  onShareClick,
  setTutorialModeOn,
  isMapLoaded
}) => (
  <SlideTransition className="topbar" visible={!isFullScreenMode} direction="top">
    <Navbar>
      <Link to="/">
        <NavbarGroup>
          <div className="logo" />
          <NavbarHeading>Visualize Change</NavbarHeading>
        </NavbarGroup>
      </Link>

      <NavbarGroup align="left">
        <ButtonGroup minimal={true}>
          <Link className="pt-button" to="/edit/">
            New
          </Link>

          <Button
            loading={saving}
            disabled={!isEditing || !canSave}
            style={{ width: 50 }}
            onClick={canSave ? onSaveClick : null}
          >
            {isEditing ? (canSave ? "Save" : "Saved") : "Save"}
          </Button>

          <Button icon="share" disabled={!onShareClick} onClick={onShareClick}>
            Share
          </Button>

          <div className="pt-button separator">|</div>

          <Link
            className={classNames("pt-button route", { active: path === "view", disabled: isLinkDisabled(path) })}
            to={`/view${id ? "/" + id : ""}`}
          >
            View
          </Link>

          <Link
            className={classNames("pt-button route", { active: path === "edit", disabled: isLinkDisabled(path) })}
            to={`/edit${id ? "/" + id : ""}`}
          >
            Edit
          </Link>

          {!isMapLoaded && <Spinner className="pt-small" />}
        </ButtonGroup>
      </NavbarGroup>

      <NavbarGroup align="right">
        <ButtonGroup minimal={true}>
          <Button icon="help" onClick={setTutorialModeOn}>
            Help
          </Button>
        </ButtonGroup>
      </NavbarGroup>
    </Navbar>
  </SlideTransition>
);

module.exports = connect(
  ({ ui }) => ({
    tutorialMode: ui.tutorialMode,
    isMapLoaded: ui.mapLoaded
  }),
  { setTutorialModeOn }
)(Topbar);
