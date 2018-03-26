const React = require("react");
const {
  AnchorButton,
  Button,
  ButtonGroup,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover,
  Menu,
  MenuItem,
  Intent
} = require("@blueprintjs/core");

const { SlideTransition } = require("./transitions");
const { Link } = require("react-router-dom");

const LanguageMenu = () => (
  <Menu>
    <MenuItem text="English" />
    <MenuItem text="Polish" />
  </Menu>
);

// TODO: add defaults
module.exports = ({ id = null, canSave, saving, isEditing, onSaveClick, onToggleViewState, isFullScreenMode }) => (
  <SlideTransition className="topbar" visible={!isFullScreenMode} direction="top">
    <Navbar>
      <NavbarGroup>
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

          <Button className={!isEditing ? "active" : ""}>
            <Link to={`/view${id ? "/" + id : ""}`}>View</Link>
          </Button>
          <Button className={isEditing ? "active" : ""}>
            <Link to={`/edit${id ? "/" + id : ""}`}>Edit</Link>
          </Button>
          <Button>
            <Link to="/">About</Link>
          </Button>
          <Button>
            <Link to="/learn">Learn</Link>
          </Button>
        </ButtonGroup>
      </NavbarGroup>
    </Navbar>
  </SlideTransition>
);
