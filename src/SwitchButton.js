import React from 'react';
import Switch from 'react-switch'

const textSwitch = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    fontSize: 20,
    color: "#ff",
    paddingRight: 2
}

class SwitchButton extends React.Component {
  constructor() {
    super()
    this.state = { checked: true };
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(checked) {
    this.props.changeMode();
    this.setState({ checked });
  }

  render() {
    return (
        <div>
            <Switch
            className = "react-switch"
            onChange = {this.handleChange} 
            checked = {this.state.checked}
            onColor = "#000000"
            offColor = "#fff"
            onHandleColor = "#fff"
            offHandleColor = "#000000"
            checkedIcon = {
                <div style = {textSwitch}></div>
            }
            uncheckedIcon={
                <div style = {textSwitch}>X</div>
            }
            />
      </div>
    );
  }
}
export default SwitchButton;