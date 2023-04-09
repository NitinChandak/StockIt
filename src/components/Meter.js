import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

const Speedometer = ({ id, value }) => {
  return (
      <ReactSpeedometer
        value={value}
        needleHeightRatio={0.7}
        ringWidth={100}
        valueTextFontSize="30px"
        width={500}
        paddingHorizontal={200}
        currentValueText="Prediction"
        customSegmentLabels={[
          {
            text: "SELL",
            position: "INSIDE",
            color: "#000",
          },
          {
            text: "",
            position: "INSIDE",
            color: "#000",
          },
          {
            text: "HOLD",
            position: "INSIDE",
            color: "#000",
          },
          {
            text: "",
            position: "INSIDE",
            color: "#000",
          },
          {
            text: "BUY",
            position: "INSIDE",
            color: "#000",
          },
        ]}
      />
  );
};

export default Speedometer;
