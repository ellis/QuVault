import React, {PropTypes} from 'react';
import {Link} from 'react-router';

export default class MainView extends React.Component {
	static propTypes = {
		children: PropTypes.object
	};

	render() {
		// console.log(this.props.children)
		return (
			<div id="main-view">
				<Link to={`/question/ff552ea6-1697-4169-8aa4-0caa1be208cf/0`}>Question</Link>
				<h1>Todos</h1>

				<hr/>
				{this.props.children}
			</div>
		);
	}
}
