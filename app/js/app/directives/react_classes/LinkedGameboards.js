define(["react", "jquery"], function(React,$) {
    return function(ContentEditor) {
        return React.createClass({

            getInitialState: function() {
                return {
                    searchString: "",
                    result: null
                }
            },

            onSearchStringChange: function(e) {
                var self = this;
                self.setState({searchString: e.target.value})

                ContentEditor.getGameboardExistenceChecker(e.target.value).then(function(gameboard) {
                    self.setState({
                        result: gameboard
                    });
                })
            },

            render: function() {
                var ids = [];
                for (var id in this.props.linkedGameboards) {
                    id = this.props.linkedGameboards[id];
                    var removeId = function(id) {
                        var newIds = JSON.parse(JSON.stringify(this.props.linkedGameboards));
                        newIds.splice(newIds.indexOf(id), 1);
                        this.props.onChange(this, this.props.linkedGameboards, newIds);
                    };

                    ids.push(<span className="tag">{id} <i className="general foundicon-remove" onClick={removeId.bind(this, id)} /></span>);
                }

                var result = false;
                if (this.state.result) {
                    var addId = function(id) {
                        var newIds = JSON.parse(JSON.stringify(this.props.linkedGameboards));
                        newIds.push(id);
                        this.props.onChange(this, this.props.linkedGameboards, newIds);
                    }
                    result = <button className={"button tiny radius id-result " + (this.state.result.questions ? "success" : "")} onClick={addId.bind(this, this.state.result.id)}>
                        Id: {this.state.result.id}<br />
                        Tags: {
                            !this.state.result.tags ? "gameboard not found" :
                            this.state.result.tags.length === 0 ? "No Tags!" :
                            this.state.result.tags.join(", ")
                        }<br /><br />
                        <i className="general foundicon-plus"/>
                    </button>;
                }

                return <div className="tags-container" ref="container">
                    {ids}
                    <input type="text" placeholder="Add IDs of linked gameboards..." value={this.state.searchString} onChange={this.onSearchStringChange} />
                    {result}
                </div>;
            }
        });
    }
})
