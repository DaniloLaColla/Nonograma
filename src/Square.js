import React from 'react';

class Square extends React.Component {
    render() {
        let clase = this.props.value !== '#' ? 'square' : 'fondoPintado'
        return (
            <button className = {clase} onClick = {this.props.onClick}>
                {this.props.value === 'X' ? this.props.value : null}
            </button>
        );
    }
}

export default Square;