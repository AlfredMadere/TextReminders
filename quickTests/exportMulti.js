const myFunc = () => {
  console.log("myFunk executed");
};

const mySecondFunc = () => {
  console.log("mySecondFunk executed");
};

const myDefaultFunc = () => {
  console.log("myDefaultFunk executed");
};

export default myDefaultFunc;

export { mySecondFunc, myFunc };
