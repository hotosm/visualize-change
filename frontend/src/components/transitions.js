const React = require("react");
const { Transition } = require("react-transition-group");

const timeout = 300;

const slideStyles = ({ axis, value }) => ({
  entering: { transform: `translate${axis}(${value})` },
  entered: { transform: `translate${axis}(0%)` }
});

const transformMap = {
  "right-visible": { axis: "X", value: "-335px" },
  right: { axis: "X", value: "-100%" },
  left: { axis: "X", value: "100%" },
  top: { axis: "Y", value: "-100%" }
};

const fadeStyles = {
  entering: { opacity: 0.5 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 }
};

const SlideTransition = ({ visible, className, direction, children }) => {
  const transformValue = transformMap[direction];
  return (
    <Transition in={visible} timeout={{ enter: 0, exit: timeout }} unmountOnExit={false}>
      {state => (
        <div
          className={`${className} slide-${direction}-transition`}
          style={{
            transition: `transform ${timeout}ms ease-in`,
            transform: `translate${transformValue.axis}(${transformValue.value})`,
            ...slideStyles(transformValue)[state]
          }}
        >
          {children}
        </div>
      )}
    </Transition>
  );
};

const FadeTransition = ({ visible, element = "div", className, style, children }) => (
  <Transition in={visible} timeout={{ enter: 0, exit: timeout }} unmountOnExit={false}>
    {state => {
      return React.createElement(
        element,
        {
          className: `${className} fade-transition`,
          style: {
            transition: `opacity ${timeout}ms`,
            opacity: 0,
            ...fadeStyles[state],
            ...style
          }
        },
        children
      );
    }}
  </Transition>
);

module.exports = {
  SlideTransition,
  FadeTransition
};
