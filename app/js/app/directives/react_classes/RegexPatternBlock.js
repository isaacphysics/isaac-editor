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

			onCheckboxToggle: function (key, _e) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc[key] = !oldDoc[key];
				this.onDocChange(this, oldDoc, newDoc);
			},

			regexHelper: function(_e) {
				var regex = this.props.doc.value
				if (this.props.doc.matchWholeString) {
					// Add caret and dollar sign if the whole string should be matched
					regex = "^" + regex + "$"
				}
				var flags = "g" + (this.props.doc.multiLineRegex ? "m" : "") + (this.props.doc.caseInsensitive ? "i" : "")
				window.open(`https://regex101.com/?regex=${encodeURIComponent(regex)}&flags=${flags}&delimiter=@&flavor=java`)
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
								<div className="row">
									<div className="column">
										<input style={{marginTop: "0"}} type="checkbox" checked={this.props.doc.matchWholeString} onChange={this.onCheckboxToggle.bind(this, "matchWholeString")} /> Entire answer has to match this pattern exactly
									</div>
									<div className="column">
										<input style={{marginTop: "0"}} type="checkbox" checked={this.props.doc.caseInsensitive} onChange={this.onCheckboxToggle.bind(this, "caseInsensitive")} /> Case insensitive
									</div>
									<div className="column">
										<input style={{marginTop: "0"}} type="checkbox" checked={this.props.doc.multiLineRegex} onChange={this.onCheckboxToggle.bind(this, "multiLineRegex")} /> Multi-line regular expression
									</div>
								</div>
								<button className="button tiny tag radius" onClick={this.regexHelper}>Test Regex</button>
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
