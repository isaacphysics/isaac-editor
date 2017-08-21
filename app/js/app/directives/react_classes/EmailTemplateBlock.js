define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, ContentValueOrChildren) {
		return React.createClass({

			getInitialState: function() {
				return {
					subject: this.props.doc.subject,
				}
			},

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onSubjectChange: function(e) {
				this.setState({
					subject: e.target.value,
					title: ""
				});

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.subject = e.target.value;
				newDoc.title = "";

				this.onDocChange(this, oldDoc, newDoc);
			},

			onPlainTextContentChange: function(c, oldVal, newVal) {

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.plainTextContent = newVal;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onHtmlContentChange: function(c, oldVal, newVal) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.htmlContent = newVal;

				this.onDocChange(this, oldDoc, newDoc);
			},

			render: function() {
				return (
					<Block type="emailTemplate" blockTypeTitle="E-mail template" doc={this.props.doc} onChange={this.onDocChange}>
						<form>
							<div className="row">
								<div className="small-12 columns">
									<label for="subjectTextBox">Subject: </label><input id="subjectTextBox" type="text" value={this.props.doc.subject} onChange={this.onSubjectChange} placeholder="E-mail subject"/>
								</div>
							</div>
							<div className="row">

								<div className="small-12 columns plain-text-content">
									<div className="separator-title">Plain text</div>
									<ContentValueOrChildren value={this.props.doc.plainTextContent} disableListOps="disabled" encoding="plain" onChange={this.onPlainTextContentChange} />
								</div>

								<div className="small-12 columns">
									<div className="separator-title">HTML</div>
									<ContentValueOrChildren value={this.props.doc.htmlContent} disableListOps="disabled" encoding="html" onChange={this.onHtmlContentChange} />
								</div>
							</div>
						</form>
					</Block>
				);
			}
		});
	}
})
