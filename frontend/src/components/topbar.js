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
  MenuItem
} = require("@blueprintjs/core");

const LanguageMenu = () => (
  <Menu>
    <MenuItem text="English" />
    <MenuItem text="Polish" />
  </Menu>
);

module.exports = () => (
  <Navbar>
    <NavbarGroup>
      <NavbarHeading>HOT Visualize Change</NavbarHeading>
    </NavbarGroup>

    <NavbarGroup align="right">
      <ButtonGroup minimal={true}>
        <Button>About</Button>
        <Button>Learn</Button>
        <Button>Create</Button>

        <Popover content={<LanguageMenu />}>
          <AnchorButton rightIcon="caret-down">English</AnchorButton>
        </Popover>
      </ButtonGroup>
    </NavbarGroup>
  </Navbar>
);
