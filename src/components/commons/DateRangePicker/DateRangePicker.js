// import "./styles.css";
import { useState, useEffect } from "react";
import MultiRangeSlider from "multi-range-slider-react";
import classes from "./DateRangePicker.modules.css"
import { appConstants } from "../utils";

export default function DateRangePicker({initStart, initEnd, handleChange}) {

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // on input: when entering/sliding values
  const [minValue, setMinValue] = useState(initStart);
  const [maxValue, setMaxValue] = useState(initEnd);

  // on change: after values set
  const [minValue2, setMinValue2] = useState(appConstants.initStartMonth);
  const [maxValue2, setMaxValue2] = useState(appConstants.initEndMonth);

  const [minCaption, set_minCaption] = useState("");
  const [maxCaption, set_maxCaption] = useState("");

  // handle value changes
  useEffect(() => {
    handleChange([minValue2, maxValue2]);
  }, [handleChange, minValue2, maxValue2]);

  return (
      <div className="classes.multi-range-slider-container">
        <MultiRangeSlider
          labels={months}
          min={0}
          max={11}
          minValue={minValue}
          maxValue={maxValue}
          step={1}
          ruler={false}
          stepOnly={true}
          minCaption={minCaption}
          maxCaption={maxCaption}
          onInput={(e) => {
            set_minCaption(months[e.minValue]);
            set_maxCaption(months[e.maxValue]);
            setMinValue(e.minValue);
            setMaxValue(e.maxValue);
          }}
          onChange={(e) => {
            setMinValue2(e.minValue);
            setMaxValue2(e.maxValue);
          }}
        />
      </div>
  );
}
