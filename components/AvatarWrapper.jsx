import React, { Component } from 'react';
import Avatar from 'avataaars';

// Este componente wrapper permite personalizar el fondo del avatar
class AvatarWrapper extends Component {
  render() {
    const { style, wrapperStyle, ...rest } = this.props;
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#2581eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...wrapperStyle
      }}>
        <Avatar
          style={{ width: '100%', height: '100%', ...style }}
          {...rest}
        />
      </div>
    );
  }
}

export default AvatarWrapper;