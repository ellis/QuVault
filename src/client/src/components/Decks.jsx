import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';

const Table = ({
	decks
}) => {
	return <table>
		<thead>
			<tr><th>Decks</th><th>New</th><th>Pending</th><th>Waiting</th></tr>
		</thead>
		<tbody>
			CONTINUE
			{_.map(decks, (row, index) => <tr key={"row"+index}>
				{_.map(columns, key => <td key={"row"+index+"_"+key}>{row[key]}</td>)}
			</tr>)}
		</tbody>
	</table>;
};

export const Decks = React.createClass({
	mixins: [PureRenderMixin],
	render: function() {
		const design = this.props.design.toJS();
		//console.log("design: "+JSON.stringify(design))
		//const table = flattenDesign(design);
		const table = (this.props.table) ? this.props.table.toJS() : [];
		//console.log("table: "+JSON.stringify(table))
		return <div>
			{/*<pre>{YAML.stringify(design, 5, 1)}</pre>*/}
			<textarea value={this.props.designText} onChange={this.handleChange}></textarea>
			<Table table={table}/>
		</div>;
	},
	handleChange: function(event) {
		console.log("handleChange:");
		console.log(event.target.value);
		this.props.setDesignText(event.target.value);
	},
});

const mapStateToProps = (state) => ({
	decks: state.getIn(["data", "decks"])
});

const actions = {
	decksReview: (deckUuid) => ({type: "decksReview", deckUuid}),
	review: () => ({type: "decksReview", deckUuid})
};

export const DecksContainer = connect(mapStateToProps, actions)(Decks);
