const React = require("react");
const classNames = require("classnames");
const { Button, ButtonGroup, Navbar, NavbarGroup, NavbarHeading, Intent } = require("@blueprintjs/core");

const { SlideTransition } = require("./transitions");
const { Link } = require("react-router-dom");

// const LanguageMenu = () => (
//   <Menu>
//     <MenuItem text="English" />
//     <MenuItem text="Polish" />
//   </Menu>
// );

// TODO: add defaults
module.exports = ({ id = null, path, canSave, saving, isEditing, onSaveClick, isFullScreenMode }) => (
  <SlideTransition className="topbar" visible={!isFullScreenMode} direction="top">
    <Navbar>
      <NavbarGroup>
        <div className="logo" />
        <NavbarHeading>HOT Visualize Change</NavbarHeading>
      </NavbarGroup>

      <NavbarGroup align="right">
        <ButtonGroup minimal={true}>
          {isEditing && (
            <Button
              intent={canSave ? Intent.PRIMARY : Intent.SUCCESS}
              loading={saving}
              onClick={canSave ? onSaveClick : null}
            >
              {canSave ? "Save" : "Saved"}
            </Button>
          )}

          <Link className="pt-button" to="/edit/">
            New
          </Link>

          <Link
            className={classNames("pt-button route", { active: path === "view" })}
            to={`/view${id ? "/" + id : ""}`}
          >
            View
          </Link>

          <Link
            className={classNames("pt-button route", { active: path === "edit" })}
            to={`/edit${id ? "/" + id : ""}`}
          >
            Edit
          </Link>

          <Link className={classNames("pt-button route", { active: path === "about" })} to="/">
            About
          </Link>

          <Link className={classNames("pt-button route", { active: path === "learn" })} to="/learn">
            Learn
          </Link>
        </ButtonGroup>
      </NavbarGroup>
    </Navbar>
  </SlideTransition>
);
