const Spinner = ({ size, color }) => {
  const style =
    size === "small"
      ? { width: "1.2rem", height: "1.2rem" }
      : { width: size, height: size, color };
  return <div style={style} className="spinner-border" role="status"></div>;
};

export default Spinner;
