define(["react", "jquery"], function(React,$) {
	return function(ContentEditor) {
		return React.createClass({

			getInitialState: function() {
				return {
					valid: true,
					editedDoc: this.props.doc
				};
			},

			componentDidMount: function() {
				var cm = app.cm = CodeMirror(this.refs.content.getDOMNode(),
					{mode: {name: "javascript", json: true},
					 theme: "eclipse",//"solarized light",
					 lineNumbers: false,
					 value: JSON.stringify(this.props.doc,null,2),
					 lineWrapping: true});

				cm.on("change", (function(inst, changeObj) {
					try {
						var newDoc = JSON.parse(cm.getValue());
						this.setState({valid: true, editedDoc: newDoc});
						for(var i = 0; i < inst.lineCount(); i++)
							inst.removeLineClass(i, "background", "cm-error-line");
					} catch (e) {
						console.error(e);
						inst.addLineClass(changeObj.from.line, "background", "cm-error-line");
						this.setState({valid: false});
					}
				}).bind(this));

			},

			onDone: function() {
				if (this.state.valid) {
					var newDoc = this.state.editedDoc;
					this.props.onDone(this, this.props.doc, newDoc);
				}
			},

			render: function() {
				return (
					<div>
						<button type="button" onClick={this.onDone}>Done</button>
						<div ref="content" />
						<button type="button" onClick={this.onDone}>Done</button>
					</div>
				);
			}
		});
	}
})
