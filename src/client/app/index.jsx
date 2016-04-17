import React from 'react';
import {render} from 'react-dom';

require('./style.css');

class App extends React.Component {
	render () {
		return <div>
			<p>Hello, React!</p>
			<img src="public/temp.jpg"/>
		</div>;
	}
}

render(<App/>, document.getElementById('app'));
