import React from 'react';
import {render} from 'react-dom';

require('./style.css');

class App extends React.Component {
  render () {
    return <p>Hello React!</p>;
  }
}

render(<App/>, document.getElementById('app'));
