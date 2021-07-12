define(["react", "jquery"], function(React,$) {
	return function(_ContentEditor, Block, ContentBlock, ContentValueOrChildren) {
		return React.createClass({

			onDocChange: function(_c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onValueChange: function(e) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.value = e.target.value;
				this.onDocChange(this, oldDoc, newDoc);
			},

			onExplanationChange: function(_c, _oldVal, newVal) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.explanation = newVal;
				this.onDocChange(this, oldDoc, newDoc);
			},

			caseInsensitive_toggle: function(_e) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.caseInsensitive = !oldDoc.caseInsensitive;
				this.onDocChange(this, oldDoc, newDoc);
			},

			multiLineRegex_toggle: function(_e) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.multiLineRegex = !oldDoc.multiLineRegex;
				this.onDocChange(this, oldDoc, newDoc);
			},

			correct_toggle: function(_e) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.correct = !oldDoc.correct;
				this.onDocChange(this, oldDoc, newDoc);
			},

			render: function() {
				var emptyExplanation = {
					type: "content",
					children: [],
					encoding: "markdown"
				};
				return (
					<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row">
							<div className="small-1 column text-right">
								{this.props.doc.correct ?
									<i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> :
									<i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
							</div>
							<div className="small-6 columns" >
								<input type="text" value={this.props.doc.value || ""} onChange={this.onValueChange} />
								<input style={{marginTop: "0"}} type="checkbox" checked={this.props.doc.caseInsensitive} onChange={this.caseInsensitive_toggle} /> Case insensitive
							</div>
							<div className="small-6 columns" >
								<input type="text" value={this.props.doc.value || ""} onChange={this.onValueChange} />
								<input style={{marginTop: "0"}} type="checkbox" checked={this.props.doc.multiLineRegex} onChange={this.multiLineRegex_toggle} /> Multi-line regular expression
							</div>
							<div className="small-5 columns" >
								<ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
							</div>
						</div>
					</Block>
				);
			}
		})
	}
})
