define(["react", "jquery"], function(React,$) {
	return function(ContentEditor) {
		return React.createClass({

			getInitialState: function() {
				return {
					searchString: "",
					results: []
				}
			},

			onSearchStringChange: function(e) {
				this.setState({
					searchString: e.target.value
				});
				var self = this;
				ContentEditor.getIdList(e.target.value).then(function(ids) {
					self.setState({
						results: ids
					});
				});
			},

			render: function() {

				var ids = [];

				for (var id in this.props.ids) {
					id = this.props.ids[id];

					var removeId = function(id) {
						var newIds = JSON.parse(JSON.stringify(this.props.ids));
						newIds.splice(newIds.indexOf(id), 1);
						this.props.onChange(this, this.props.ids, newIds);
					};

					ids.push(<span className="tag">{id} <i className="general foundicon-remove" onClick={removeId.bind(this, id)} /></span>);
				}

				var results = [];
				for (var result in this.state.results) {
					result = this.state.results[result];

					if (this.props.ids.indexOf(result.id) > -1)
						continue;

					var addId = function(id) {
						var newIds = JSON.parse(JSON.stringify(this.props.ids));
						newIds.push(id);
						this.props.onChange(this, this.props.ids, newIds);
					}

					var type = result.type;

					if (type == "isaacQuestionPage")
						type = "Question";

					if (type == "isaacConceptPage")
						type = "Concept";

					results.push(<button className={"button tiny " + (type == 'Question' ? 'success' : '') + " radius id-result"} onClick={addId.bind(this,result.id)}>{result.title} ({type})<br/>{result.id} <i className="general foundicon-plus"/></button>)
				}

				return <div className="tags-container" ref="container">
					{ids}
					<input type="text" placeholder="Type to add related content..." value={this.state.searchString} onChange={this.onSearchStringChange} />
					{results}
				</div>;
			}
		});
	}
})
