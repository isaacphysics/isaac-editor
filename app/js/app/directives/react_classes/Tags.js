define(["react", "jquery"], function(React,$) {
	return function(ContentEditor) {
		
		var nextTagListId = 0;
		return React.createClass({

			getDefaultProps: function() {
				return {
					dropdownId: nextTagListId++
				};
			},

			getInitialState: function() {
				return {
					allTags: [],
					searchString: "",
					results: []
				};
			},

			componentDidMount: function() {
				$(document).foundation();
				var self = this;
				ContentEditor.getTagList().then(function(tags) {
					self.setState({allTags: tags.sort()});
				})
			},

			componentDidUpdate: function(nextProps, nextState) {
				$(document).foundation();
			},

	        onSearchStringChange: function(e) {
	            this.setState({
	                searchString: e.target.value.toLowerCase()
	            });
	            var self = this;
	            ContentEditor.getTagList().then(function(tags) {
					var filteredList = tags.filter(function(v) {
						return v.indexOf(self.state.searchString) != -1;
					});
					self.setState({ results: filteredList });
				});
	        },

			addTagFromList: function(e) {
	            var l = this.props.tags.concat(e.toLowerCase());
				this.props.onChange(this, this.props.tags, $.unique(l));
			},

			render: function() {

				var ts = [];

				for(var t in this.props.tags.sort()) {
					t = this.props.tags[t];

					var removeTag = function(t) {
						var newTags = JSON.parse(JSON.stringify(this.props.tags));
						newTags.splice(newTags.indexOf(t),1);
						this.props.onChange(this, this.props.tags, newTags);
					};

					ts.push(<span className="tag">{t} <i className="general foundicon-remove" onClick={removeTag.bind(this, t)}/></span>);

					var foundTags = [];
					for (var result in this.state.results) {
						result = this.state.results[result];
						foundTags.push(<button className={"button tiny tag radius id-result"} onClick={this.addTagFromList.bind(this, result)}> {result} <i className="general foundicon-plus"/></button>);
					}
					if(this.state.searchString != "") {
	                    foundTags.push(<button className={"button tiny success radius id-result"} onClick={this.addTagFromList.bind(this, this.state.searchString)}> Create new tag: {this.state.searchString} <i className="general foundicon-plus"/></button>);
	                }
				}

				return (<div className="tags-container" ref="container">
					{ts}
					<input type="text" placeholder="Type to add tags..." value={this.state.searchString} onChange={this.onSearchStringChange} />
					{foundTags}
				</div>);
			}
		});
	}
})
