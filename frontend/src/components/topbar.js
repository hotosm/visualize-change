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
        <Button disabled>About</Button>
        <Button disabled>Learn</Button>
        <Button disabled>Create</Button>

        <Popover content={<LanguageMenu />}>
          <AnchorButton disabled rightIcon="caret-down">
            English
          </AnchorButton>
        </Popover>
      </ButtonGroup>
    </NavbarGroup>
  </Navbar>
);
