define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, ContentBlock) {
		return React.createClass({

			getInitialState: function() {
				return {
					editing: false,
					editedValue: this.props.doc.value,
					editedUnits: this.props.doc.units
				};
			},

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onContentChange: function(c, oldVal, newVal, oldUnits, newUnits) {
				// newVal could be a string or a list.
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.value = newVal;
				newDoc.units = newUnits;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onExplanationChange: function(c, oldVal, newVal) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.explanation = newVal;

				this.onDocChange(this, oldDoc, newDoc);
			},

			correct_toggle: function(e) {

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);

				newDoc.correct = !oldDoc.correct;

				this.onDocChange(this, oldDoc, newDoc);
			},

			componentDidMount: function() {
				if (ContentEditor.enableMathJax && this.refs.content)
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
			},

			componentDidUpdate: function() {
				MathJax.resetLabels();

				if (ContentEditor.enableMathJax && this.refs.content)
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);

			},

			edit: function() {
				this.setState({
					editing: true
				});

				if (ContentEditor.enableMathJax && this.refs.content)
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
			},

			done: function() {
				this.setState({
					editing: false
				});

				this.onContentChange(this, this.props.doc.value, this.state.editedValue, this.props.doc.units, this.state.editedUnits);

				if (ContentEditor.enableMathJax && this.refs.content)
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
			},

			setEditedValue: function(e) {
				this.setState({editedValue: e.target.value});
			},

			setEditedUnits: function(e) {
				this.setState({editedUnits: e.target.value});
			},

			render: function() {

				var emptyExplanation = {
					type: "content",
					children: [],
					encoding: "markdown"
				};

				if (this.state.editing) {
					var content = <div ref="content">
						{[
							"$\\\\quantity{",
							<input type="text" placeholder="Value" style={{width: "80px", display: "inline-block"}} onChange={this.setEditedValue} value={this.state.editedValue} />,
							"}{",
							<input type="text" placeholder="Units" style={{width: "80px", display: "inline-block"}} onChange={this.setEditedUnits} value={this.state.editedUnits} />,
							"}$"
						]}
						&nbsp;<button onClick={this.done} className="button tiny">Done</button>
					</div>;
				} else {
					var html = "$\\quantity{" + (this.props.doc.value || "") + "}{" + (this.props.doc.units || "") + "}$";

					if (this.props.doc.value) {
						var content = <span onClick={this.edit} ref="content" dangerouslySetInnerHTML={{__html: html}}></span>;
					} else {
						var content = <span onClick={this.edit} ref="content" > <i>Enter value and units here</i></span>;
					}
				}

				return (
					<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row">
							<div className="small-1 column text-right">
								{this.props.doc.correct ?
									<i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> :
									<i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
							</div>
							<div className="small-6 columns" >
								{content}
							</div>
							<div className="small-5 columns" >
								<ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
							</div>
						</div>
					</Block>
				);
			}
		});
	}
})
